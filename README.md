# Simple Payments
A litle app for sending / receiving payments using a ledger on supabase

## Getting Started

### 0. Setup this Repo

Clone this project, `cd` into the correct directory, and run `npm i`.

### 1. Create a new Supabase Project

Use this [link](https://supabase.com/dashboard/new?plan=free&kind=PERSONAL&size=1&spend_cap=true)

### 2. Setup Connection URLs

Navigate to [Database Settings](https://supabase.com/dashboard/project/_/settings/database) and copy the session and transaction URLs from the `Connection String` section and add them to the `.env` file. Make sure to replace the placeholder password with your own.

### 3. Setup the Database

`npm run migration/gen`

and then:

`npm run migration/exe`

### 4. Start the Development Server

`npm run dev`

### 5. Open two tabs at `http://localhost:3000`

### Tab 1
- click the `fund` button to fund your account

### Tab 2
- click the `receive` button
- copy the account id

### Tab 1
- click the `send` button
- pase the account id in to the `recipient` field
- enter the amount of tokens to transfer
- hit `send`

You should see the balances update!