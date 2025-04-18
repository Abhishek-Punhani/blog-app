## Setup Instructions

1.  **Clone the Repository (if you haven't already):**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Install Backend Dependencies:**
    Navigate to the backend directory and install the required Python packages. It's recommended to use a virtual environment.
    ```bash
    cd blog-app-be
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Configure Backend Environment Variables:**
    Create a `.env` file in the `blog-app-be` directory by copying the example:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file and add your API keys:
    ```dotenv
    # blog-app-be/.env
    GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
    NEWSDATA_API_KEY=YOUR_NEWSDATA_IO_API_KEY
    ```
    * Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    * Get your Newsdata.io API key from [Newsdata.io](https://newsdata.io/).

4.  **Install Frontend Dependencies:**
    Navigate to the frontend directory and install the Node.js packages.
    ```bash
    cd ../blog-app-fe 
    npm install
    ```

5.  **Configure Frontend Environment Variables:**
    Create a `.env` file in the `blog-app-fe` directory (if it doesn't exist) and add the required variable:
    ```dotenv
    NEXT_PUBLIC_FLASK_URL=YOUR_FLASK_BACKEND_URL
    ```
    Replace YOUR_FLASK_BACKEND_URL with the URL of your Flask backend.

## Running the Application

From the **root directory** of the monorepo (where the main `package.json` is located), run the following command:

```bash
npm start
```