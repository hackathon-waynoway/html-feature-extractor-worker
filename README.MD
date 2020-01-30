# html-feature-extractor-worker

The goal of this project is to create a dataset that can be used with machine learning models in order to take a webapage and output the events on it.

http://webdatacommons.org/structureddata/2019-12/stats/schema_org_subsets.html

The following properties from events will be classified: name, startDate, location.

## Setup
1. Take the data retrieved from web data commons and place it into the "data" directory in this repository. [schema_Event.gz](http://schema.org/Event.
http://data.dws.informatik.uni-mannheim.de/structureddata/2019-12/quads/classspecific/md/schema_Event.gz)

2. Create your .env file if you want to run the worker in a docker container locally (instead of in AWS)
    ```text
    AWS_ACCESS_KEY_ID=[AWS_ACCESS_KEY_ID]
    AWS_SECRET_ACCESS_KEY=[AWS_SECRET_ACCESS_KEY]
    AWS_REGION=[AWS_REGION]
    SQS_QUEUE_URL=[SQS_QUEUE_URL]
    S3_BUCKET_NAME=[S3_BUCKET_NAME]
    ```

3. Create a file in the terraform directory called "terraform.tfvars" with the following contents if you want to run the worker in a docker container in AWS Fargate.
    ```
    profile = "[aws_profile]"
    region  = "aws_region"
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
    --cap-add=SYS_ADMIN \
    bmccarthy/html-feature-extractor-worker
```

## Run html-feature-extractor-worker in AWS Fargate
```shell
docker build -t bmccarthy/html-feature-extractor-worker .

eval $(aws ecr get-login --no-include-email --region [aws_region] --profile [aws_profile])
docker tag bmccarthy/html-feature-extractor-worker [aws_account_id].dkr.ecr.[aws_region].amazonaws.com/html-feature-extractor-worker:latest
docker push aws_account_id.dkr.ecr.[aws_region].amazonaws.com/html-feature-extractor-worker:latest
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
export AWS_PROFILE="[aws_profile]" && \
node src/populate-queue.js \
    -q https://sqs.[aws_region].amazonaws.com/aws_account_id]/html-feature-extractor-worker-queue \
    -i data/unique_urls.txt \
    -c 2
```

## Download All JSON Files
After the worker has finished processing, it will place all scraped websites in S3 as individual json files and corresponding screenshots.  These can be downloaded with the aws cli using the below command.
```shell
aws s3 cp s3://html-feature-extractor-worker-output/[source_parameter]/ . --recursive --exclude "*" --include "*.json" --profile [aws_profile]
```

## TODO
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
