---
layout: ./_mdlayout.astro
title: "Ben Isenstein | Technical CV"
description: "Technical CV of software developer Ben Isenstein."
page: "cv"
---
# Ben Isenstein Technical CV

[View This CV Online](https://www.notion.so/Ben-Isenstein-Technical-CV-f94ef3142b794ff0a49838388e446061?pvs=21)

[View Resume](https://www.notion.so/Ben-Isenstein-Full-Stack-Developer-934ddb85026d4484873274d6f6f2f0d7?pvs=21)

Ben Isenstein

Calgary, Alberta, Canada

**Contact**

---

**Call and text local in Canada:** 403-477-4176

**Call and text if abroad:** 917-936-1492

**WhatsApp regardless of locale:** 403-477-4176

**Email:** [ben.isenstein@gmail.com](mailto:ben.isenstein@gmail.com)

**LinkedIn:** [https://www.linkedin.com/in/benisenstein](https://www.linkedin.com/in/benisenstein)

# **Curriculum Vitae**

## **2016**

---

**High school diploma**, Crescent Heights High School, Calgary, Alberta, Canada

**Grade 12 Math award**: 100% on the provincial exam

**Accepted offer to study Jazz Piano** at the University of Toronto, Faculty of Music

## **2020**

---

**Achieved Bachelor of Music** in Jazz Piano Performance with Honors, University of Toronto

**Completed Zero To Hero in Python**, Skillshare

- Data types in python
- Prompting for input on the command line
- Working in Jupyter Notebook
- Basic games in Jupyter Notebook: Blackjack, tic-tac-toe

## **2021**

---

**Completed JavaScript Data Structures and Algorithms** on [https://www.freecodecamp.org/](https://www.freecodecamp.org/)

- Data types in JavaScript
- Advanced methods for strings, arrays, objects
- Final challenges: Palindrome Checker, Roman Numeral Converter, Caesar’s Cipher, Telephone Number Validator, Cash Register

**Completed 6-month full stack developer program** at InceptionU, non-profit organization

- Built full stack applications with Node.js, Express, MongoDB, React
- Ideated, designed, and implemented several applications from scratch in a small team
- Explored personality strengths and weaknesses via [Lumina](https://luminalearning.com/en_ca/lumina-spark-3/) and [Lifepath](https://www.inceptionu.com/lifepath)

**Built and released a React component package** on NPM, [react-hook-superform](https://github.com/BenIsenstein/react-hook-superform/tree/main)

- Extensive use of [react-hook-form](https://react-hook-form.com/) APIs
- [Styled-components](https://styled-components.com/)
- Extensible through custom React components as input fields
- Date picker out-of-the-box with [react-datetime-picker](https://www.npmjs.com/package/react-datetime-picker)

**Contracted for** [Rendezvous Scents](https://www.rendezvousscents.com/), created a Shopify store and custom UI

- Custom CSS styles within storefront source code
- Product page custom UI using Shopify’s “Liquid” templating language + CSS + JS
- Custom features including product carousel using Liquid + CSS + JS
- Used Shopify GraphQL API to manage selling plans, product collections and subscriptions

## **2022**

---

**Began a working relationship with DevTheory Inc.** as a consultant for [**OMERS**](https://www.omers.com/) (Ontario Municipal Employees Retirement Service)

> *“For more than 60 years, OMERS has humbly served as the steward and guardian of the retirement income of more than half a million active, deferred and retired municipal employees from communities across Ontario.

With a world-class team of investors and professionals across offices in North America, Europe, Asia and Australia, OMERS has generated $127.4 billion in net assets, as at June 30, 2023, making it one of the largest defined benefit pension plans in Canada.”*
> 

Built the **Knowledge Exchange** application at OMERS:

- Internal data management platform
- Aggregate search over several data platforms within the business:
    - Employee data via Microsoft APIs: Sharepoint, Graph
    - 3rd party data governance API [Collibra](https://www.collibra.com/us/en?utm_medium=redirect&utm_source=test-drive-close)
    - Open government data from Canada and US governments via [CKAN](https://ckan.org/)
    - Financial research articles from the Equity Research project
- Customized and faceted search via [Microsoft Cognitive Search](https://azure.microsoft.com/en-ca/products/ai-services/cognitive-search/)
- Database: MS SQL Server, Azure Blob Storage
- Backend: Serverless Azure Functions in TypeScript
- Frontend: React in Typescript

Built the **Equity Research** application at OMERS:

- Data pipeline for research articles made by financial analysts
- Emails and attachments are turned into flexible documents within Azure Cognitive Search
- UI within the Knowledge Exchange allows search, edit, delete, and download of documents
- Shared Outlook inbox to receive research
- Azure Logic App to take email content through stages of processing
- Pub/sub model for alerting analysts to each other’s research updates
- Email templating with EJS
- Database: Azure Table Storage (NoSQL), Azure Blob Storage
- Backend: Serverless Azure Functions in Typescript
- Frontend: hosted entirely within the Knowledge Exchange

Built a **Notion Integration** personal project:

- [See on Github](https://github.com/BenIsenstein/notion_integration_1)
- Notion has been the “frontend” for all of my notes, journals, todos, organization, and productivity since 2022
- Using Notion’s API to read and manipulate data can vastly extend its use cases
- Newsletter emails pipeline
- Bidirectional sync between Google contacts and a Notion database of my contacts through interval polling
- Deleting empty journal pages when I didn’t write anything
- Youtube viewer
- Database: MongoDB → migrated to SQLite
- Backend: BunJS + Express, Python + Flask
- Frontend: [Notion](https://www.notion.so/product)
- Hosting: [Railway](https://railway.app/)

## **2023**

---

Built the **RAPID** application at OMERS:

- Extensible dashboard application leveraging PowerBI, Sharepoint, and OMERS internal products
- Built around dashboards, made of widgets
- Widgets feature content from several sources:
    - PowerBI Report of choice
    - A single page from a PowerBI Report
    - A Sharepoint file browser
    - Search results from the Equity Research product
    - Other internal products
- Libraries to browse and add widgets to dashboards
- Database: MS SQL Server
- Backend: Serverless Azure Functions in Python
- Frontend: React in TypeScript

Built **John Conway’s Game of Life** personal project:

- [See on Github](https://github.com/BenIsenstein/conway_game_of_life)
- [View this project live](https://conwaygameoflife-production.up.railway.app/)
- Presenting Conway’s Game of Life with enjoyable UI design
- An opportunity to practice design principles from the book [“Refactoring UI”](https://www.refactoringui.com/)
- An opportunity to learn the browser Canvas API
- Object-oriented programming, focused on composability
- Prioritize efficient memory usage

**Open source contributions:**

- [Sinonjs/timers](https://github.com/sinonjs/fake-timers) → https://github.com/sinonjs/fake-timers/commit/871f5c889bcc343847381ffaf1c6a3cc0873d8d1
- [Python-cheatsheet](https://github.com/wilfredinni/python-cheatsheet) → https://github.com/wilfredinni/python-cheatsheet/commit/38b58a9f5704b7d0d956acdbd7f2d2ea0042e582

Built a **Demonstration E-Commerce React App:**

- [See on Github](https://github.com/BenIsenstein/shyft-labs-spa)
- [View this project live](https://shyft-labs-spa-production.up.railway.app/)
- Was done in a 72-hour period for an interview process
- React app using vite, tailwindCSS, and redux
- Features products from [Fake Store API](https://fakestoreapi.com/)
- Two pages → Product listing and cart
- Responsive and built with a mobile-first approach