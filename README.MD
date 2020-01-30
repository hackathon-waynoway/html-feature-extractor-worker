# html-feature-extractor-worker

The goal of this project is to create a dataset that can be used with machine learning models in order to take a webapage and output the events on it.

http://webdatacommons.org/structureddata/2019-12/stats/schema_org_subsets.html

The following properties from events will be classified: name, startDate, location.

## Setup
1. Take the data retrieved from web data commons and place it into the "data" directory in this repository. [schema_Event.gz](http://schema.org/Event.
http://data.dws.informatik.uni-mannheim.de/structureddata/2019-12/quads/classspecific/md/schema_Event.gz)

2. Create your .env file
    ```text
    AWS_ACCOUNT_ID=[AWS_ACCOUNT_ID]
    AWS_PROFILE=[AWS_PROFILE]
    AWS_ACCESS_KEY_ID=[AWS_ACCESS_KEY_ID]
    AWS_SECRET_ACCESS_KEY=[AWS_SECRET_ACCESS_KEY]
    AWS_REGION=[AWS_REGION]
    SQS_QUEUE_URL=[SQS_QUEUE_URL]
    S3_BUCKET_NAME=[S3_BUCKET_NAME]
    ```
## Unique URLs
The data/schema_Event.gz file contains many duplicate urls. We only want to scrape unique urls so we can run the below command to get a new text file with unique urls.
```shell
python3 unique_urls.py
```

## Run html-feature-extractor-worker Locally
```shell
docker build -t bmccarthy/html-feature-extractor-worker .

docker run \
    --env-file .env \
    bmccarthy/html-feature-extractor-worker
```

## Run html-feature-extractor-worker in AWS Fargate
Terraform needs to be applied first from within the "terraform folder"
```shell
terraform apply -var-file=../.env
```

```shell
docker build -t bmccarthy/html-feature-extractor-worker .

env $(cat .env | xargs) sh -c '$(aws ecr get-login --no-include-email)'
env $(cat .env | xargs) sh -c 'docker tag bmccarthy/html-feature-extractor-worker `printenv AWS_ACCOUNT_ID`.dkr.ecr.`printenv AWS_REGION`.amazonaws.com/html-feature-extractor-worker:latest'
env $(cat .env | xargs) sh -c 'docker push `printenv AWS_ACCOUNT_ID`.dkr.ecr.`printenv AWS_REGION`.amazonaws.com/html-feature-extractor-worker:latest'
```

## Run Queue Populator
This command will send messages to the queue the html-feature-extractor-worker is listening to. Each message will look like:
```json
{
    "url": "url_to_parse",
    "source": "source/version_of_experiment"
}
```
```shell
env $(cat .env | xargs) node src/populate-queue.js \
    -q https://sqs.`printenv AWS_REGION`.amazonaws.com/`printenv AWS_ACCOUNT_ID`/html-feature-extractor-worker-queue \
    -i data/unique_urls.txt \
    -c 2
```

## Download All JSON Files
After the worker has finished processing, it will place all scraped websites in S3 as individual json files and corresponding screenshots.  These can be downloaded with the aws cli using the below command. Be sure to replace [source_parameter] with the s3 prefix used when running the populate-queue.js script.
```shell
env $(cat .env | xargs) aws s3 cp s3://html-feature-extractor-worker-output/[source_parameter]/ . --recursive --exclude "*" --include "*.json"
```

## Analyze Data
All data analysis is done in the get_features.ipynb notebook.

## TODO
* Do not use "--no-sandbox" when using puppeteer. Some ideas here https://github.com/Zenika/alpine-chrome#-the-best-with-seccomp
* Take image generated and add bounding boxes - http://aheckmann.github.io/gm/docs.html#drawing-primitives
* Don't save elements which are invisible (height/width = 0)
* create requirements.txt file for python dependencies: scikitlearn, numpy, pandas, matplotlib
* Experiment with different models:
    * Input html element, output whether it is event or not an event
    * Input html element, output whether it is event, name, location, startDate
    * Input entire html page and solve it like a segmentation problem. instead of segmenting pixed, segment html elements 

## Helpful links

* [Using AI to Automate Web Crawling](https://www.semantics3.com/blog/ai-for-automated-web-crawling/)
* [Chargrid: Towards Understanding 2D Documents](https://arxiv.org/pdf/1809.08799.pdf)
* [fastai-petfinder](https://github.com/EtienneT/fastai-petfinder)
* [OpenML](https://www.openml.org)

## Citations:

* [The WebDataCommons Microdata, RDFa and Microformat Dataset Series](https://www.wim.uni-mannheim.de/fileadmin/lehrstuehle/ki/pub/Meusel-etal-TheWDCMicrodataRdfaMicroformatsDataSeries-ISWC2014-rbds.pdf) by Robert Meusel, Petar Petrovski, and Christian Bizer in the Proceedings of the 13th International Semantic Web Conference: Replication, Benchmark, Data and Software Track (ISWC2014).
