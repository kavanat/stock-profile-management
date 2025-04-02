#!/bin/bash
export JAVA_HOME=/Users/kavanat/Library/Java/JavaVirtualMachines/corretto-17.0.14/Contents/Home

# Create target directory if it doesn't exist
mkdir -p target/classes

# Create classpath with all dependencies
CLASSPATH="lib/*"

# Compile all Java files with dependencies
javac -d target/classes -cp "$CLASSPATH" src/main/java/com/example/portfolioservice/*.java src/main/java/com/example/portfolioservice/*/*.java

# Create JAR file with dependencies
jar cfm target/stock-portfolio-app-0.0.1-SNAPSHOT.jar src/main/resources/META-INF/MANIFEST.MF -C target/classes .

# Copy dependencies to target/lib
mkdir -p target/lib
cp lib/* target/lib/

echo "Build completed. JAR file created at target/stock-portfolio-app-0.0.1-SNAPSHOT.jar" 