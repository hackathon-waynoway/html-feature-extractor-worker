# html-feature-extractor-worker

The goal of this project is to create a dataset that can be used with machine learning models in order to take a webapage and output the events on it.

http://webdatacommons.org/structureddata/2019-12/stats/schema_org_subsets.html

The following properties from events will be classified: name, startDate, location.

## Setup
1. Take the data retrieved from web data commons and place it into the "data" folder in this repository. [schema_Event.gz](http://schema.org/Event.
http://data.dws.informatik.uni-mannheim.de/structureddata/2019-12/quads/classspecific/md/schema_Event.gz)

## Steps of Project
1. Filter all items from file to unique urls which contain at least an event with name, startDate, location.
    a. This will help trim down the number of sites we go to.  We don't actually use the information (name, startDate, location) from this file since it may be stale already and not exist on the website.  Instead we are looking for websites who tend to markup their events with these properties.
2. Pass these urls to the checker.js script to further filter this list down to those where we can creating training data from:
    a. Use pupeteer to go to the website and use some parser to make sure it has some Event schema data (might be able to just use css selectors to check for itemscope, itemprop attributes)
    b. Attempt to map the name, location, startDate to the actual (visible) html element.  Sometimes pages will have non-visible elements which have the itemscope/itemprop on them instead of having them directly on the visible html elements
    c. Output from this script should be features for this webpage:
        1. Each visible html element:
            * height, width, top_left_x, top_left_y, bottom_right_x, bottom_right_y, screenshot, text of element, html_tag, html_class_names, html_id, font_size, number_of_font_sizes, avg_font_size, max_font_size, min_font_size, foreground_color, number_of_different_colors?, how_deep_elements_nested, how_deep_this_element_is, font_weight
        2. url, render_date_time, status (parsed, not_easily_parsed, no_events)
        3. output thes items as one file per page

## Worker
SQS Message
```json
{
    "url": "url_to_parse",
    "source": "source/version_of_experiment"
}
```

## Run Local
```shell
docker build -t bmccarthy/html-feature-extractor-worker .

iam-docker-run \
     --image bmccarthy/html-feature-extractor-worker \
     --aws-role-name html-feature-extractor-worker-container-task-role \
     --host-source-path ./src \
     --container-source-path /app/src \
     --interactive \
     --profile personal \
     --full-entrypoint "node /app/src/local.js"

docker run -rm -it --entrypoint /bin/bash bmccarthy/html-feature-extractor-worker

docker run -rm -it -v output:/home/node/app/output --entrypoint "node /home/node/app/local.js" bmccarthy/html-feature-extractor-worker
```

## Run Worker
```shell
export AWS_PROFILE="bmccarthy" && \
export SQS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/109628666462/html-feature-extractor-worker-queue" && \
export S3_BUCKET_NAME="html-feature-extractor-worker-output" && \
node src/worker.js
```

## Ren Queue Populator
```shell
export AWS_PROFILE="bmccarthy" && \
node src/populate-queue.js
```
## Deployment
Must have terraform/terrform.tfvars file with the following contents:
```
profile = "aws_profile_name"
region  = "aws_region"
```

Build and upload image to ECR
```shell
eval $(aws ecr get-login --no-include-email --region us-east-1 --profile bmccarthy)
docker tag bmccarthy/html-feature-extractor-worker 109628666462.dkr.ecr.us-east-1.amazonaws.com/html-feature-extractor-worker:latest
docker push 109628666462.dkr.ecr.us-east-1.amazonaws.com/html-feature-extractor-worker:latest
```

## TODO
* Use FarGate instead of ECS. No Need to provision server?
* Dockerfile should use pupeteer without "no-sandbox"
* find out how to do AssumeRole 
* take image generated and add bounding boxes - http://aheckmann.github.io/gm/docs.html#drawing-primitives
* Don't save elements which are invisible (height/width = 0)
* find out how to represent the itemtype=Event, itemprop=name, itemprop=location, and itemprop=startDate attributes on the output from the scraper https://github.com/tomav/node-microdata-scraper/blob/master/index.js

## Models
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

