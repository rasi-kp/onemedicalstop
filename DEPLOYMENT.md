# Deployment Guide

This deployment guide provides instructions on how to deploy the One-Stop Medical Shop project using Docker and Docker Compose.

## Prerequisites

Before you begin the deployment process, ensure you have the following prerequisites installed:

- Docker: You can download Docker [here](https://www.docker.com/get-started).
- Docker Compose: You can download Docker Compose [here](https://docs.docker.com/compose/install/).
- Access to a machine or server that meets the project's hardware requirements.

## Deployment Steps

### Step 1: Clone the Repository

Clone the project repository to your local machine:

-git clone https://github.com/rasi-kp/onemedicalstop.git
-cd onemedicalstop

### Step 2: Set up Environment

NEO4J_USER= neo4j
NEO4J_PASS= password
CONSUMER_KEY= your_consumer_key
CONSUMER_SECRET= your_consumer_secret

Step 3: Start the Application

docker-compose up -d

Step 4: Access the Application
Once the application is up and running, you can access the One-Stop Medical Shop at  localhost:3000 

Step 5: Stopping the Application

docker-compose down

## Troubleshooting

docker logs <container_id_or_name>

- Verify the status of Docker containers:
        docker ps

## Conclusion

You have successfully deployed the One-Stop Medical Shop project! For any further assistance, refer to the project README .
Thank you for using the One-Stop Medical Shop!
