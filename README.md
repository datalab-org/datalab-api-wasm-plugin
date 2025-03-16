# datalab-api-wasm-plugin

Some experients with some LLM-generated code for running the `datalab-api` package in the browser directly (without the notebook interface in front of it).

The aim is to demonstrate how to use the `datalab-api` Python package directly in the browser using WebAssembly through Pyodide. 
This approach eliminates the need for users to install Python or any dependencies locally.
This repository will be used to test the feasibility of running the `datalab-api` package in the browser using Pyodide.

## Features

- **Browser-based Python execution** using Pyodide
- **No installation required** for end users
- **Direct package usage** - uses the actual `datalab-api` package from PyPI
- **Step-by-step tests** using Playwright to verify functionality
- **Automated testing** using GitHub Actions

## Getting Started

### Running Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/datalab-api-wasm-plugin.git
   cd datalab-api-wasm-plugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:8080`

### Using Docker

1. Build the Docker image:
   ```bash
   npm run docker:build
   ```

2. Run the container:
   ```bash
   npm run docker:run
   ```

3. Open your browser to `http://localhost:8080`

## Running Tests

The project includes automated tests that verify Pyodide initialization and package functionality:

```bash
npm test
```

This runs a series of tests using Playwright:
1. Loading the application page
2. Initializing Pyodide
3. Importing the `datalab-api` package
4. Running a basic example

## Project Structure

```
.
├── index.html              # Main HTML file with Pyodide integration
├── package.json            # NPM package configuration
├── Dockerfile              # Docker configuration for containerization
├── README.md               # This documentation
├── data/                   # Example data files (optional)
└── tests/
    ├── test-pyodide.js     # Playwright test script
    └── screenshots/        # Test screenshots (generated during tests)
```

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

## Development Notes

### Package Compatibility

For a Python package to work in Pyodide, it must meet these requirements:
-
