const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tinytask-mern.web.app",
      "https://tinytask-mern.firebaseapp.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);
app.use(express.json());
app.use(express.urlencoded());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.mkoje4m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // Database NAme
    const database = client.db("TinyTask");
    const AllUser = database.collection("All_Users");
    const AllQuestions = database.collection("All_Questions");
    const Admin_Data = database.collection("admin_panel");
    const Question_Solved = database.collection("question-solved");
    const requestedQuestionsBySeller = database.collection(
      "requested-questions-by-seller"
    );
    const requestedForPaymentBySeller = database.collection(
      "requested_for_payment_by_seller"
    );
    const Success_Payment_Details = database.collection(
      "Success_Payment_Details"
    );

    // --------------------------------------------------------
    // Admin Data
    // --------------------------------------------------------

    // Get Admin Data
    app.get("/admin", async (req, res) => {
      try {
        const objectName = req.query.object;
        const objectEmail = req.query.email;
        // console.log("Object Name:", objectName);
        // console.log("Object Email:", objectEmail);

        // Find your fixed document by _id
        const doc = await Admin_Data.findOne({
          _id: new ObjectId("6838ccb0570614c9873fe82d"),
        });

        if (!doc) {
          return res.status(404).send({ message: "Admin data not found" });
        }

        if (!objectName) {
          return res.status(200).send({
            message: "Admin Data - full document",
            data: doc,
          });
        }

        if (!(objectName in doc)) {
          return res
            .status(404)
            .send({ message: `Object '${objectName}' not found` });
        }
        var finalData = doc[objectName];
        if (objectEmail) {
          finalData = [...finalData].find((element) => {
            // console.log("Element Email:", element.email);
            if (element.email === objectEmail) {
              return element;
            }
          });
        }

        // console.log("Final Data:", finalData);
        return res.status(200).send({
          message: `Admin Data for '${objectName}'`,
          data: finalData,
        });
      } catch (error) {
        // console.error(error);
        return res.status(500).send({ message: "Server error" });
      }
    });

    app.patch("/update-question-status/:id", async (req, res) => {
      const questionId = req.params.id;
      const { status } = req.body;

      // console.log("Updating question status for ID:", questionId);
      // console.log("New status:", status);

      if (!["approved", "denied", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      try {
        const result = await requestedQuestionsBySeller.updateOne(
          { _id: new ObjectId(questionId) },
          { $set: { status: status } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({ message: "Status updated successfully" });
      } catch (error) {
        console.error("Error updating question status:", error);
        res.status(500).json({ message: "Server error while updating status" });
      }
    });

    // -----------------------------------------------------------------

    // Post User Informations
    app.post("/register", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await AllUser.insertOne(user);
      res
        .status(201)
        .send({ message: "User added successfully.", data: result });
    });

    // --------------------------------------------------------

    // Get Current User Data
    app.get("/currentUser", async (req, res) => {
      const email = req.query.email;
      console.log("mme", email);
      const query = { email: email };
      const user = await AllUser.findOne(query);
      if (user) {
        res.status(200).send({ message: "User found", data: user });
      } else {
        res.status(404).send({ message: "User not found" });
      }
    });

    // --------------------------------------------------------
    //Post Completed Tasks
    app.post("/completed-task", async (req, res) => {
      const { emailID, questionsID, questionsSolution, questionsCategory } =
        req.body;

      if (
        !emailID ||
        !questionsID ||
        !questionsSolution ||
        !questionsCategory ||
        !questionsCategory
      ) {
        return res.status(400).send({
          message: "Missing emailID, questionsID or questionsSolution",
        });
      }

      const solvedEntry = {
        questionsID,
        questionsSolution,
        questionsCategory,
      };

      try {
        const result = await Question_Solved.updateOne(
          { emailID },
          {
            $addToSet: {
              solved: solvedEntry, // Add the object only if not already present
            },
          },
          { upsert: true }
        );

        console.log("Update Result:", result);

        res.send({
          message: "Task updated successfully",
          result,
        });
      } catch (error) {
        console.error("Error in /completed-task:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    //---------------------------------------------------------
    // Get Completed Tasks
    app.get("/completed-task", async (req, res) => {
      const emailID = req.query.email;
      console.log("Email ID:", emailID);
      if (!emailID) {
        return res.status(400).send({ message: "Email ID is required" });
      }

      try {
        const completedTasks = await Question_Solved.findOne({ emailID });

        if (!completedTasks) {
          return res.status(404).send({ message: "No completed tasks found" });
        }

        res.status(200).send({
          message: "Completed tasks retrieved successfully",
          data: completedTasks,
        });
      } catch (error) {
        console.error("Error in /completed-task:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // -------------------------------------------------------
    
    // Post Questions
    app.post("/post-questions", async (req, res) => {
      const question = req.body;
      console.log(question);
      const result = await AllQuestions.insertOne(question);
      res
        .status(201)
        .send({ message: "Question added successfully.", data: result });
    });
    // Get All Questions
    app.get("/all-questions", async (req, res) => {
      const category = req.query.category;
      console.log("Category:", category);
      const query = category ? { questionCategory: category } : {};
      const cursor = AllQuestions.find(query);
      const questions = await cursor.toArray();
      res.status(200).send({ message: "All Questions", data: questions });
    });

    // Coin Update
    app.post("/coin-history", async (req, res) => {
      const { email, questionId, scoreChange, status, timestamp } = req.body;

      if (!email || !questionId || !scoreChange || !status) {
        return res.status(400).send({ message: "Missing required fields" });
      }

      const coinEntry = {
        questionId,
        scoreChange,
        status, // "gain" or "loss"
        timestamp: timestamp || new Date(),
      };

      try {
        const result = await Question_Solved.updateOne(
          { emailID: email },
          {
            $push: {
              coinHistory: coinEntry,
            },
          },
          { upsert: true }
        );

        res.status(200).send({
          message: "Coin history added to question-solved document",
          result,
        });
      } catch (error) {
        console.error("Error saving coin history:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // User Coin History update
    app.patch("/update-coin", async (req, res) => {
      const { email, coinChange } = req.body;
      if (!email || typeof coinChange !== "number") {
        return res.status(400).send({ message: "Missing email or coinChange" });
      }

      try {
        const result = await AllUser.updateOne(
          { email },
          { $inc: { coin: coinChange } } // increase or decrease
        );
        res.send({ message: "Coin updated", result });
      } catch (error) {
        console.error("Error updating coin:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // ----------------------------------------------------------------
    // Seller Section
    // ----------------------------------------------------------------

    // Request to Add Questions
    app.post("/request-question", async (req, res) => {
      try {
        const question = req.body;

        // Basic validation
        if (!question.questionName || !question.questionAuthorEmail) {
          return res
            .status(400)
            .json({ success: false, message: "Missing fields" });
        }

        // Insert into the database
        const result = await requestedQuestionsBySeller.insertOne({
          ...question,
        });
        console.log("Received question:", result);

        // Deduct 1 coin from seller
        await AllUser.updateOne(
          { email: question.questionAuthorEmail },
          { $inc: { coin: -1 } }
        );

        // res.json({ success: true, insertedId: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // Seller Get Requested Questions and Status count
    app.get("/seller-questions", async (req, res) => {
      const email = req.query.email || "";

      try {
        const allQuestions = await requestedQuestionsBySeller
          .find({ ...(email ? { questionAuthorEmail: email } : {}) })
          .toArray();

        // Count statuses
        const statusCounts = {
          approved: 0,
          pending: 0,
          denied: 0,
        };

        allQuestions.forEach((q) => {
          if (q.status === "approved") {
            statusCounts.approved += 1;
          } else if (q.status === "pending") {
            statusCounts.pending += 1;
          } else if (q.status === "denied") {
            statusCounts.denied += 1;
          }
        });

        res.json({
          success: true,
          questions: allQuestions,
          statusCounts,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // Toogle Roles
    // PATCH /api/users/toggle-role/:email
    app.patch("/toggle-role", async (req, res) => {
      const email = req.query.email;
      console.log("Toggling role for email:", email);
      try {
        const user = await AllUser.findOne({ email });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const newRole = user.role === "Player" ? "Seller" : "Player";

        const updateResult = await AllUser.updateOne(
          { email },
          { $set: { role: newRole } }
        );

        if (updateResult.modifiedCount === 0) {
          return res.status(500).json({ message: "Failed to update role" });
        }

        // Send updated user data back
        const updatedUser = await AllUser.findOne({ email });

        res.json({
          message: "Role updated successfully",
          data: updatedUser,
        });
        console.log("Role updated successfully:", updatedUser);
      } catch (error) {
        console.error("Toggle role error:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ----------------------------------------------------------
    // Payment Section For Package
    // ----------------------------------------------------------
    app.post("/seller/dashboard-request", async (req, res) => {
      const { buyerId, packageName, packageCredit, timestamp } = req.body;
      console.log(req.body);

      if (!buyerId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const requestData = {
        buyerId,
        packageName,
        packageCredit,
        status: "pending",
        timestamp: timestamp || new Date(),
      };

      try {
        const result = await requestedForPaymentBySeller.insertOne(requestData);
        res.json({
          success: true,
          message: "Request stored successfully",
          data: result,
        });
        console.log(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: "Failed to store request" });
      }
    });

    // Get Seller Payment Requests
    app.get("/seller/dashboard-request", async (req, res) => {
      const email = req.query.email || "";
      console.log("Email:", email);

      try {
        const requests = await requestedForPaymentBySeller
          .find({ ...(email ? { buyerId: email } : {}) })
          .toArray();

        res.json({ success: true, data: requests });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // ----------------------------------------------------------------
    // SSL Commerce Section
    // ----------------------------------------------------------------
    app.post("/payment-initialization", async (req, res) => {
      const requestedData = req.body;
      console.log("Payment Initialization Data:", requestedData);

      // SSL Commerce API URL
      const data = {
        store_id: process.env.SSL_STORE_ID,
        store_passwd: process.env.SSL_STORE_PASSWORD,
        total_amount: requestedData.packageCredit, // Total amount to be paid
        currency: "BDT",
        tran_id: requestedData.transactionId, // use unique tran_id for each api call
        success_url: "http://localhost:5000/success-payment",
        fail_url: "http://localhost:5000/fail",
        cancel_url: "http://localhost:5000/cancel",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: requestedData.packageName,
        product_category: "Seller-Package",
        product_profile: "general",
        cus_name: requestedData.buyerName,
        cus_email: requestedData.buyerEmail,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      // console.log(data);

      try {
        const response = await fetch(
          "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(data).toString(),
          }
        );

        const result = await response.json();
        // console.log("SSLCommerz Response:", result.redirectGatewayURL);

        // send the Gateway URL back to frontend
        res.send({ success: true, GatewayPageURL: result.GatewayPageURL });
      } catch (error) {
        console.error("SSLCommerz API Error:", error);
        res
          .status(500)
          .send({ success: false, error: "Payment initialization failed." });
      }
    });

    // Success Payment Route
    app.post("/success-payment", async (req, res) => {
      const paymentData = req.body;
      console.log("Payment Success Data:", paymentData);

      // Here you can handle the successful payment data
      const {
        tran_id,
        val_id,
        amount,
        currency,
        status,
        card_type,
        card_no,
        bank_tran_id,
      } = paymentData;

      // Find the requested payment by transaction ID

      const query = { _id: new ObjectId(String(tran_id)) };
      const findPaymentInfo = await requestedForPaymentBySeller.findOne(query);
      console.log("Find User:", findPaymentInfo);

      // Insert the successful payment details into the Success_Payment_Details collection
      const paymentDetails = {
        transactionId: tran_id,
        valId: val_id,
        price:amount,
        currency:currency,
        status:status,
        cardType: card_type,
        cardNo: card_no,
        bankTranId: bank_tran_id,
        buyerId: findPaymentInfo.buyerId, // Assuming buyerId is stored in the request
        packageName: findPaymentInfo.packageName,
        packageCredit: findPaymentInfo.packageCredit,
        timestamp: new Date(),
      };

      const result = await Success_Payment_Details.insertOne(paymentDetails);
      console.log("Payment Details Inserted:", result);

      // Update the requested payment status to 'paid'
      await requestedForPaymentBySeller.updateOne(query, {
        $set: { status: "paid" }
      });

      // Update the user's coin balance
      await AllUser.updateOne(
        { email: findPaymentInfo.buyerId },
        { $inc: { coin: parseInt(findPaymentInfo.packageCredit) },$set: { package: findPaymentInfo.packageName  } } // Assuming packageCredit is a number,
        
      );
      res.redirect("https://tinytask-mern.web.app/dashboard");
      res.send({ success: true, message: "Payment successful",paymentData });
    });
    app.post("/fail", (req, res) => {
      res.redirect("https://tinytask-mern.web.app/dashboard");
    });
    app.post("/cancel", (req, res) => {
      res.redirect("https://tinytask-mern.web.app/dashboard");
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
