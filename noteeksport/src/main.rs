use anyhow::{bail, Result};
use dotenv;
use futures::stream::StreamExt;
use mongodb::Database;
use mongodb::{bson::doc, options::ClientOptions, Client};
use s3::bucket::Bucket;
use s3::creds::Credentials;
use s3::Region;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{collections::HashMap, io::prelude::*};
use std::{env, io};

fn expect_env_var(var: &str) -> String {
    dotenv::dotenv().ok();
    env::var(&var).expect(&var)
}

fn setup_s3_bucket() -> Result<Bucket> {
    let s3_bucket = expect_env_var("S3_BUCKET");
    let s3_endpoint = expect_env_var("S3_ENDPOINT");
    let s3_region = expect_env_var("S3_REGION");
    let s3_key = expect_env_var("S3_KEY");
    let s3_secret = expect_env_var("S3_SECRET");

    let region = Region::Custom {
        region: s3_region,
        endpoint: s3_endpoint,
    };
    let credentials = Credentials::new(Some(&s3_key), Some(&s3_secret), None, None, None)?;
    Bucket::new(&s3_bucket, region, credentials).map_err(anyhow::Error::msg)
}

async fn setup_mongo_database() -> Result<Database> {
    let mongo_url = expect_env_var("MONGO_URL");
    let client_options = ClientOptions::parse(mongo_url).await?;
    let client = Client::with_options(client_options)?;
    Ok(client.database("nidarholm"))
}

async fn verify_file(hash: &String, path: &String) -> Result<()> {
    let mut file = std::fs::File::open(path)?;
    let mut sha256 = Sha256::new();
    io::copy(&mut file, &mut sha256)?;
    let result = sha256.finalize();
    let hex = base16ct::lower::encode_string(&result);
    if hash.clone() == hex {
        Ok(())
    } else {
        bail!("Did not match")
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let output_dir = expect_env_var("OUTPUT_DIR");

    let bucket = setup_s3_bucket()?;

    let database = setup_mongo_database().await?;
    let pieces = database.collection::<Piece>("pieces");
    let files = database.collection::<File>("files");

    let mut file_cursor = match files.find(doc! {}, None).await {
        Ok(cursor) => cursor,
        Err(e) => panic!("Could not get file cursor: {e}"),
    };

    let mut file_map = HashMap::new();
    while let Some(file) = file_cursor.next().await {
        match file {
            Ok(file) => file_map.insert(file.id.clone(), file),
            Err(e) => {
                println!("File error {e}");
                None
            }
        };
    }

    let mut piece_list = vec![];
    let mut piece_cursor = match pieces.find(doc! {}, None).await {
        Ok(cursor) => cursor,
        Err(e) => panic!("Could not get cursor: {e}"),
    };

    while let Some(piece) = piece_cursor.next().await {
        match piece {
            Ok(piece) => piece_list.push(piece),
            Err(e) => {
                println!("Piece error {e}");
            }
        };
    }

    let mut alle_notesett: Vec<Notesett> = vec![];

    std::fs::create_dir_all(&output_dir)?;

    for piece in piece_list {
        let title = match piece.subtitle.clone() {
            Some(subtitle) => match subtitle.as_str() {
                "" => piece.title.clone(),
                subtitle => format!(
                    "{title} ({subtitle})",
                    title = piece.title,
                    subtitle = subtitle
                ),
            },
            None => piece.title.clone(),
        };
        let composers = piece.composers.join(", ");
        let arrangers = piece.arrangers.join(", ");
        let archive_number = format!(
            "ArkivNr: {archive_number:04}",
            archive_number = piece.archive_number
        );
        let formatted_archive_number = format!(
            "ArkivNr{archive_number:04}",
            archive_number = piece.archive_number
        );
        let notesett = Notesett {
            id: piece.archive_number,
            title: title.clone(),
            composers: composers.clone(),
            arrangers: arrangers.clone(),
            archive_number: archive_number.clone(),
            number_of_files: piece.scores.len(),
        };
        if piece.scores.len() > 0 {
            let directory = format!("{output_dir}/{id} - {title}", id = formatted_archive_number);
            std::fs::create_dir_all(&directory)?;

            let metadata=format!(
                    "Tittel = {title}\r\nKomponist = {composers}\r\nArrangør = {arrangers}\r\nPlassering = {archive_number}\r\n",
                );
            let metadata_path = format!("{directory}/metadata.txt");
            std::fs::write(&metadata_path, metadata)?;

            for score in piece.scores {
                let file = file_map.get(&score);
                if let Some(file) = file {
                    let local_path = format!("{directory}/{filename}", filename = file.filename);
                    let s3_url = format!(
                        "/nidarholm/files/originals/{}/{}/{}",
                        &file.hash[0..2],
                        &file.hash[2..4],
                        file.hash
                    );

                    println!("{local_path}");
                    match verify_file(&file.hash, &local_path).await {
                        Ok(_) => println!("OK"),
                        Err(_) => {
                            println!("Refetch");
                            let data = bucket.get_object(&s3_url).await?;

                            let mut file = std::fs::File::create(&local_path)?;
                            file.write_all(data.bytes())?;
                        }
                    }
                }
            }
        };
        alle_notesett.push(notesett);
    }

    alle_notesett.sort_by(|a, b| a.id.cmp(&b.id));

    {
        let path = format!("{output_dir}/metadata.csv");
        let mut file = std::fs::File::create(&path)?;
        let mut csv_writer = csv::WriterBuilder::new()
            .delimiter(b';')
            .terminator(csv::Terminator::CRLF)
            .quote_style(csv::QuoteStyle::NonNumeric)
            .from_writer(&mut file);
        csv_writer.write_record(&[
            "ArkivNr",
            "Tittel",
            "Antall filer (stemmer)",
            "Komponist",
            "Arrangør",
            "Plassering",
        ])?;

        for notesett in alle_notesett {
            csv_writer.write_record(&[
                &notesett.id.to_string(),
                &notesett.title,
                &notesett.number_of_files.to_string(),
                &notesett.composers,
                &notesett.arrangers,
                &notesett.archive_number,
            ])?;
        }
        csv_writer.flush()?;
        //zip.write_all(csv_writer)?;
    }

    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
struct Piece {
    //#[serde(rename = "_id")]
    //id: String,
    title: String,
    subtitle: Option<String>,
    composers: Vec<String>,
    arrangers: Vec<String>,
    archive_number: u16,
    scores: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct File {
    #[serde(rename = "_id")]
    id: String,
    filename: String,
    hash: String,
}

#[derive(Debug)]
struct Notesett {
    id: u16,
    title: String,
    composers: String,
    arrangers: String,
    archive_number: String,
    number_of_files: usize,
}
