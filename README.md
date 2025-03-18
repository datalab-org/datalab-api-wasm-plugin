# datalab-api-wasm-plugin

> [!WARNING]  
> This repository contains mostly untested LLM-generated code. It was created as a proof-of-concept for running the *datalab* Python API in the browser and should not be considered production-ready. Use at your own risk and please contribute improvements if you find issues.

Some experients with some LLM-generated code for running the `datalab-api` package in the browser directly (without the notebook interface in front of it).

The aim is to demonstrate how to use the `datalab-api` Python package directly in the browser using WebAssembly through Pyodide.
This approach eliminates the need for users to install Python or any dependencies locally.
This repository will be used to test the feasibility of running the `datalab-api` package in the browser using Pyodide.

## Usage

### Running Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/datalab-org/datalab-api-wasm-plugin.git
   cd datalab-api-wasm-plugin
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn start
   ```

4. Open your browser to `http://localhost:8080`

### Using Docker

1. Build the Docker image:
   ```bash
   yarn docker:build
   ```

2. Run the container:
   ```bash
   yarn docker:run
   ```

3. Open your browser to `http://localhost:8080`

## Running Tests

The project includes automated tests that verify Pyodide initialization and package functionality:

```bash
yarn test
```

This runs a series of tests using Playwright:
1. Loading the application page
2. Initializing Pyodide
3. Importing the `datalab-api` package
4. Running a basic example

## How It Works

1. **Pyodide Initialization**:
   - Loads the Pyodide JavaScript library
   - Sets up a Python runtime in the browser
   - Installs core dependencies (numpy, pandas, matplotlib)

2. **Package Installation**:
   - Attempts to install the `datalab-api` package using micropip
   - Falls back to a demo mode if installation fails

3. **Code Execution**:
   - Executes Python code directly in the browser
   - Captures output and errors
   - Displays visualizations in the UI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
