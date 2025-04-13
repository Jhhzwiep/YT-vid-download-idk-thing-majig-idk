# File Host App

This project is a simple file hosting application that allows users to drag and drop files for upload. The uploaded files are stored in a Supabase database and are accessible via generated links. Files are hosted for a duration of 2 days, after which users can purchase a subscription for extended hosting.

## Features

- Drag and drop interface for easy file uploads
- Automatic link generation for uploaded files
- Files hosted for 2 days
- Subscription model for extended hosting

## Project Structure

```
file-host-app
├── src
│   ├── index.html        # Main HTML document
│   ├── styles            # Contains CSS files
│   │   └── style.css     # Styles for the application
│   ├── scripts           # Contains JavaScript files
│   │   └── app.js        # Main application logic
├── package.json          # npm configuration file
├── README.md             # Project documentation
└── .env                  # Environment variables
```

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd file-host-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase API keys:
   ```
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

4. Open `src/index.html` in your browser to view the application.

## Usage

- Drag and drop files into the designated area to upload.
- After uploading, a link to the file will be generated.
- Files will be hosted for 2 days. To extend hosting, consider purchasing a subscription.

## License

This project is licensed under the MIT License.