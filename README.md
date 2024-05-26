[![codecov](https://codecov.io/github/danishx99/property-management-app/branch/testing/graph/badge.svg?token=JUAHB2EAP1)](https://codecov.io/github/danishx99/property-management-app)

# CommonGrounds Residential Management

Welcome to CommonGrounds Residential Management! This project is designed to assist body corporates of sectional titles in executing their responsibilities effortlessly and smoothly.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Installation and Running](#installation-and-running)
- [Environment Variables](#environment-variables)
- [License](#license)

## Prerequisites

Before starting, ensure you meet the following requirements:

- **Node.js v16.x**: Ensure that Node.js version 16.x is installed. Download it from the [official Node.js website](https://nodejs.org/).
- **MS Build Tools for C++ Development**: To compile native C++ code required by tools like TensorFlow (used in face-api.js), ensure MS Build Tools are installed.

## Setup

### MS Build Tools for C++ Development

For dependencies like face-api.js, MS Build Tools for C++ development need to be installed:

1. **Open Visual Studio Installer**.
2. **Install the "Desktop development with C++" workload**.

## Installation and Running

Follow these steps to install the project dependencies and start the development server:

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/danishx99/common-grounds-app.git
    ```

2. **After cloning, navigate to the Server Directory**:
    ```bash
    cd server
    ```

3. **Install Dependencies**:
    ```bash
    npm install
    ```

4. **Start the Development Server**:
    ```bash
    npm run start
    ```

## Environment Variables

The project utilizes a `.env` file for local testing that contains necessary secrets and environment variables. For security reasons, this `.env` file will be provided separately through a Moodle submission. After cloning the repository, download the `.env` file from Moodle and place it in the root directory of the project.


---

Thank you for using CommonGrounds Residential Management! Feel free to contact us if you have any questions or need assistance.
