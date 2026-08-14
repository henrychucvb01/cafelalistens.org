const SUPABASE_URL =
  "https://dgjeowpksgwzldnwnvvl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_O7IQlgPKBSi0cxVWZyIHkg_8xeWxrmH";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


let rating = 0;

let foodGood = null;
let serviceGood = null;

let foodReason = null;
let serviceReason = null;


// -----------------------------
// STAR RATING
// -----------------------------

const stars =
  document.querySelectorAll("#stars button");

stars.forEach(star => {

  star.addEventListener("click", () => {

    rating =
      Number(star.dataset.rating);

    stars.forEach(s => {

      if (
        Number(s.dataset.rating) <= rating
      ) {

        s.classList.add("active");

      } else {

        s.classList.remove("active");

      }

    });

  });

});


// -----------------------------
// FOOD BUTTONS
// -----------------------------

const foodYes =
  document.getElementById("tasteYes");

const foodNo =
  document.getElementById("tasteNo");

const foodReasons =
  document.getElementById("foodReasons");


foodYes.addEventListener("click", () => {

  foodGood = true;
  foodReason = null;

  foodYes.classList.add("selected");
  foodNo.classList.remove("selected");

  foodReasons.classList.add("hidden");

  clearFoodReasonSelection();

  updateCommentRequirement();

});


foodNo.addEventListener("click", () => {

  foodGood = false;

  foodNo.classList.add("selected");
  foodYes.classList.remove("selected");

  foodReasons.classList.remove("hidden");

  updateCommentRequirement();

});


// -----------------------------
// FOOD REASONS
// -----------------------------

const foodReasonButtons =
  document.querySelectorAll(
    "[data-food-reason]"
  );


foodReasonButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      foodReason =
        button.dataset.foodReason;

      foodReasonButtons.forEach(b => {
        b.classList.remove("selected");
      });

      button.classList.add("selected");

      updateCommentRequirement();

    }
  );

});


function clearFoodReasonSelection() {

  foodReasonButtons.forEach(button => {
    button.classList.remove("selected");
  });

}


// -----------------------------
// SERVICE BUTTONS
// -----------------------------

const serviceYes =
  document.getElementById("serviceYes");

const serviceNo =
  document.getElementById("serviceNo");

const serviceReasons =
  document.getElementById(
    "serviceReasons"
  );


serviceYes.addEventListener(
  "click",
  () => {

    serviceGood = true;
    serviceReason = null;

    serviceYes.classList.add(
      "selected"
    );

    serviceNo.classList.remove(
      "selected"
    );

    serviceReasons.classList.add(
      "hidden"
    );

    clearServiceReasonSelection();

    updateCommentRequirement();

  }
);


serviceNo.addEventListener(
  "click",
  () => {

    serviceGood = false;

    serviceNo.classList.add(
      "selected"
    );

    serviceYes.classList.remove(
      "selected"
    );

    serviceReasons.classList.remove(
      "hidden"
    );

    updateCommentRequirement();

  }
);


// -----------------------------
// SERVICE REASONS
// -----------------------------

const serviceReasonButtons =
  document.querySelectorAll(
    "[data-service-reason]"
  );


serviceReasonButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      serviceReason =
        button.dataset.serviceReason;

      serviceReasonButtons.forEach(b => {
        b.classList.remove("selected");
      });

      button.classList.add(
        "selected"
      );

      updateCommentRequirement();

    }
  );

});


function clearServiceReasonSelection() {

  serviceReasonButtons.forEach(
    button => {
      button.classList.remove(
        "selected"
      );
    }
  );

}


// -----------------------------
// COMMENT REQUIREMENT
// -----------------------------

const commentBox =
  document.getElementById("comment");


function updateCommentRequirement() {

  const otherSelected =
    foodReason === "Other" ||
    serviceReason === "Other";


  if (otherSelected) {

    commentBox.placeholder =
      "Please tell us what we could improve...";

  } else {

    commentBox.placeholder =
      "Tell us about your experience...";

  }

}


// -----------------------------
// SUBMIT
// -----------------------------

const submitButton =
  document.getElementById(
    "submitButton"
  );


submitButton.addEventListener(
  "click",
  async () => {

    const school =
      document.getElementById(
        "school"
      ).value;

    const comment =
      commentBox.value.trim();


    // SCHOOL

    if (!school) {

      alert(
        "Please choose your school."
      );

      return;
    }


    // OVERALL RATING

    if (!rating) {

      alert(
        "Please rate your overall experience."
      );

      return;
    }


    // FOOD RATING

    if (foodGood === null) {

      alert(
        "Please rate the food."
      );

      return;
    }


    // FOOD REASON

    if (
      foodGood === false &&
      !foodReason
    ) {

      alert(
        "Please tell us what could be improved about the food."
      );

      return;
    }


    // SERVICE RATING

    if (serviceGood === null) {

      alert(
        "Please rate the service."
      );

      return;
    }


    // SERVICE REASON

    if (
      serviceGood === false &&
      !serviceReason
    ) {

      alert(
        "Please tell us what could be improved about the service."
      );

      return;
    }


    // OTHER REQUIRES COMMENT

    if (
      (
        foodReason === "Other" ||
        serviceReason === "Other"
      ) &&
      comment === ""
    ) {

      alert(
        "Please tell us a little more about what we could improve."
      );

      commentBox.focus();

      return;
    }


    // PREVENT DOUBLE SUBMISSION

    submitButton.disabled = true;

    submitButton.textContent =
      "Submitting...";


    // SEND TO SUPABASE

    const { error } =
      await db
        .from("meal_feedback")
        .insert([
          {

            school: school,

            rating: rating,

            taste_good:
              foodGood,

            friendly_service:
              serviceGood,

            food_reason:
              foodReason,

            service_reason:
              serviceReason,

            comment:
              comment

          }
        ]);


    // ERROR

    if (error) {

      console.error(
        "Supabase error:",
        error
      );

      alert(
        "Sorry, your feedback could not be submitted."
      );

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Submit Feedback";

      return;
    }


    // SUCCESS

    submitButton.style.display =
      "none";


    document
      .getElementById(
        "thankYou"
      )
      .classList.remove(
        "hidden"
      );

  }
);
