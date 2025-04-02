#!/bin/bash

# Create .mvn directory and wrapper subdirectory
mkdir -p .mvn/wrapper

# Download the Maven wrapper JAR
curl -o .mvn/wrapper/maven-wrapper.jar https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar

# Create maven-wrapper.properties
echo "distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.5/apache-maven-3.9.5-bin.zip" > .mvn/wrapper/maven-wrapper.properties

# Download mvnw script
curl -o mvnw https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw

# Make mvnw executable
chmod +x mvnw

echo "Maven wrapper setup complete!" 