# RavenTextEditor App

RavenTextEditor is a simple text editor web application built in a Node.js environment.  
It integrates with the RavenDB database using the RavenDB Node.js client to store user documents and their versions.  

The app demonstrates the use of document revisions for versioning, enabling users to save versions for each document save and revert to older versions as needed.

![App Screenshot](https://github.com/user-attachments/assets/61f03b4d-7fdd-4ed9-bb19-c06819623015)

> **Note:**  
> This project is for demonstration purposes only. It currently supports a single user (“Users/1-A”) but is designed to be extended for multiple users.  
> To enable multi-user functionality, additional implementation is required to include a registration and login mechanism and updates to the endpoints, as noted in the comments.

---

## Setting Up the App

To store documents and their versions, we set up a RavenDB server and created a database named **"DocEditorDB"**.  
Additionally, a **revisions configuration** was added to the database to ensure a new revision (version) is created for every document change.

### Adding the Revisions Configuration

1. **Open RavenDB Studio** and navigate to the desired database:<br>
   ![RavenDB Studio Screenshot](https://github.com/user-attachments/assets/7c8355cc-029f-4ed1-b8e9-181fd5477ad3)

2. **Navigate to "Documents Revisions"** and add a new configuration for the desired collection:<br>
   ![Revisions Configuration Screenshot](https://github.com/user-attachments/assets/06b4b762-ed44-471f-8319-07c9b9276833)

3. **Configure the "Documents" collection** to enable revisions:<br>
   ![Documents Collection Configuration Screenshot](https://github.com/user-attachments/assets/2ace65f8-28dc-4124-9177-ee337f999b12)

---

## Quick Instructions to Run the App Locally

Follow these steps to set up and run the app locally:

1. **Set up a local unsecured RavenDB server** at `http://127.0.0.1:8086`.  
   Refer to the official documentation for setup instructions: 
   [Installation: Setup Wizard Walkthrough | RavenDB 6.0 Documentation](https://ravendb.net/docs/article-page/6.0/csharp/start/installation/setup-wizard-walkthrough)

2. **Create a database** named **"DocEditorDB"** and configure it as described in the [Setting Up the App](#setting-up-the-app) section.

3. **Install Node.js.**  
   You can find more information and download it here: [Node.js Official Website](https://nodejs.org)

4. **Download the "RavenTextEditor" app** from the repository:  
   [RavenTextEditor GitHub Repository](https://github.com/shaharhikri/RavenTextEditor)

5. **Run the application:**  
   - Open a terminal in the app directory.  
   - Run the following command:
     ```bash
     npm run start
     ```

6. **Access the application client (UI):**  
   Open a web browser and navigate to: [http://127.0.0.1:8080](http://127.0.0.1:8080)

---

Enjoy using the RavenTextEditor!
