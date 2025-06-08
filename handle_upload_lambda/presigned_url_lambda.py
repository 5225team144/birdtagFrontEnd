import json
import boto3
import os
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
bucket = '5225birdtags3-01' # Replace with your own S3 bucket name

def lambda_handler(event, context):
    # Handle OPTIONS request for CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }
    
    try:
        body_raw = event.get('body')
        if body_raw is None:
            raise Exception("No body found in event")
        
        body = json.loads(event['body'])
        file_name = body['file_name']
        file_type = body['file_type']  # e.g., 'image/png'

        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket,
                'Key': f'originals/{file_name}',
                'ContentType': file_type
            },
            ExpiresIn=900  # expire after 15 minutes
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"uploadURL": presigned_url})
        }

    except ClientError as e:
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
