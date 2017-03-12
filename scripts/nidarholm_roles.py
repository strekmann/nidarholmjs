# -*- encoding: utf-8 -*-

import json
import base64
#import subprocess
from Crypto.Cipher import AES
from urllib2 import urlopen


def decrypt(edata, password):
    edata = base64.urlsafe_b64decode(edata)
    aes = AES.new(password, AES.MODE_CBC, password[:16])
    return unpad(aes.decrypt(edata))

def unpad(padded):
    pad = ord(padded[-1])
    return padded[:-pad]

def main():
    with open('settings.json') as settings_file:
        settings = json.load(settings_file)
        password = settings['password']
        server_address = settings['server_address']

        url = server_address + '/organization/role_aliases.json'

        contents = urlopen(url).read()
        decoded = decrypt(contents, password)
        data = json.loads(decoded)

        print(data)

if __name__ == '__main__':
    main()
