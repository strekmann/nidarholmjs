import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation AddScoreMutation($input: AddScoreInput!) {
    addScore(input: $input) {
      piece {
        files {
          edges {
            node {
              id
              filename
              path
            }
          }
        }
        groupscores {
          id
          name
          files {
            edges {
              node {
                id
                ...ScoreItem_file
              }
            }
          }
        }
      }
    }
  }
`;

function commit(
  environment,
  { filename, hex, mimetype, size, piece, groupscore },
  onCompleted,
) {
  const variables = {
    input: {
      filename,
      hex,
      mimetype,
      size,
      pieceId: piece.id,
      groupId: groupscore.id,
    },
  };

  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
  });
}

export default { commit };
