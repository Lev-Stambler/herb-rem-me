import dryscrape
import sys

session = dryscrape.Session()
session.visit(sys.argv[1])
response = session.body()
print(response)
sys.stdout.flush()
