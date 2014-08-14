# -*- encoding: utf-8 -*-

import json
import base64
import subprocess
from Crypto.Cipher import AES
from urllib2 import urlopen

SECRET = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
BLOCK_SIZE = 16


def pad(data):
    pad = BLOCK_SIZE - len(data) % BLOCK_SIZE
    return data + pad * chr(pad)


def unpad(padded):
    pad = ord(padded[-1])
    return padded[:-pad]


def encrypt(data, password):
    data = pad(data)
    aes = AES.new(password, AES.MODE_CBC, password[:16])
    encrypted = aes.encrypt(data)
    return base64.urlsafe_b64encode(encrypted)


def decrypt(edata, password):
    edata = base64.urlsafe_b64decode(edata)
    aes = AES.new(password, AES.MODE_CBC, password[:16])
    return unpad(aes.decrypt(edata))


def request(groups):
    data = {'prefix': "nidarholm-", 'groups': groups}
    data = json.dumps(data)
    encoded = encrypt(data, SECRET)
    #url = ("http://localhost:3000/organization/updated_email_lists.json/" +
    url = ("http://nidarholm.no/organization/updated_email_lists.json/" +
           encoded)

    contents = urlopen(url).read()

    decoded = decrypt(contents, SECRET)
    data = json.loads(decoded)

    for listname, group in data.items():
        new_list = file("/tmp/" + listname, "w")
        for email in group:
            new_list.write(email + "\n")
        new_list.close()

        # next level
        command = '/usr/sbin/sync_members -f /tmp/' + listname + ' ' + listname
        print command
        process = subprocess.Popen(command.split(), shell=False,
                                   stdout=subprocess.PIPE)
        output = process.communicate()[0]
        if output:
            print "==================================="
            print group
            print output


def main():
    request(["Medlemmer", "Styret", "Plankom"])
    request(["Fløyte", "Obo", "Fagott", "Klarinett", "Saksofon", "Horn",
             "Småmessing", "Trombone", "Euph", "Tuba", "Slagverk"])


if __name__ == "__main__":
    main()
