#!/usr/bin/python
import sys
import gzip

urls = {}
destFileNmae = sys.argv[1] # output filename

count = 0
with gzip.open('data/schema_Event.gz','rt') as f:
    for line in f:
        # If line is empty then end of file reached
        if not line :
            break
        parsedLine = line.split()

        url = parsedLine[-2].replace('<', '').replace('>', '')
        
        if url not in urls:
            urls[url] = 1 
            count = count + 1
        
        # if count == 10: break

with open(destFileNmae, "w") as f:
    for url in urls:
        print(url, file=f)
