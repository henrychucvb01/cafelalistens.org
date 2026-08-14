const SUPABASE_URL = "https://dgjeowpksgwzldnwnvvl.supabase.co";

const SUPABASE_KEY = "sb_publishable_O7IQlgPKBSi0cxVWZyIHkg_8xeWxrmH";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// STATE
// ==========================================

let rating = 0;

let foodGood = null;
let serviceGood = null;

let foodReason = null;
let serviceReason = null;

// ==========================================
// ELEMENTS
// ==========================================

const stars = document.querySelectorAll("#stars button");

const foodYes = document.getElementById("tasteYes");

const foodNo = document.getElementById("tasteNo");

const foodReasons = document.getElementById("foodReasons");

const serviceYes = document.getElementById("serviceYes");

const serviceNo = document.getElementById("serviceNo");

const serviceReasons = document.getElementById("serviceReasons");

const commentBox = document.getElementById("comment");

const submitButton = document.getElementById("submitButton");

const thankYou = document.getElementById("thankYou");

const foodReasonButtons = document.querySelectorAll("[data-food-reason]");

const serviceReasonButtons = document.querySelectorAll("[data-service-reason]");

// ==========================================
// STAR RATING
// ==========================================

stars.forEach((star) => {
  star.addEventListener("click", () => {
    rating = Number(star.dataset.rating);

    stars.forEach((s) => {
      if (Number(s.dataset.rating) <= rating) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });
  });
});

// ==========================================
// FOOD
// ==========================================

foodYes.addEventListener("click", () => {
  foodGood = true;
  foodReason = null;

  foodYes.classList.add("selected");

  foodNo.classList.remove("selected");

  foodReasons.classList.add("hidden");

  clearFoodReasons();

  updateCommentPlaceholder();
});

foodNo.addEventListener("click", () => {
  foodGood = false;

  foodNo.classList.add("selected");

  foodYes.classList.remove("selected");

  foodReasons.classList.remove("hidden");

  updateCommentPlaceholder();
});

// ==========================================
// FOOD REASONS
// ==========================================

foodReasonButtons.forEach((button) => {
  button.addEventListener("click", () => {
    foodReason = button.dataset.foodReason;

    foodReasonButtons.forEach((b) => {
      b.classList.remove("selected");
    });

    button.classList.add("selected");

    updateCommentPlaceholder();
  });
});

function clearFoodReasons() {
  foodReasonButtons.forEach((button) => {
    button.classList.remove("selected");
  });
}

// ==========================================
// SERVICE
// ==========================================

serviceYes.addEventListener("click", () => {
  serviceGood = true;
  serviceReason = null;

  serviceYes.classList.add("selected");

  serviceNo.classList.remove("selected");

  serviceReasons.classList.add("hidden");

  clearServiceReasons();

  updateCommentPlaceholder();
});

serviceNo.addEventListener("click", () => {
  serviceGood = false;

  serviceNo.classList.add("selected");

  serviceYes.classList.remove("selected");

  serviceReasons.classList.remove("hidden");

  updateCommentPlaceholder();
});

// ==========================================
// SERVICE REASONS
// ==========================================

serviceReasonButtons.forEach((button) => {
  button.addEventListener("click", () => {
    serviceReason = button.dataset.serviceReason;

    serviceReasonButtons.forEach((b) => {
      b.classList.remove("selected");
    });

    button.classList.add("selected");

    updateCommentPlaceholder();
  });
});

function clearServiceReasons() {
  serviceReasonButtons.forEach((button) => {
    button.classList.remove("selected");
  });
}

// ==========================================
// COMMENT PLACEHOLDER
// ==========================================

function updateCommentPlaceholder() {
  if (foodReason === "Other" || serviceReason === "Other") {
    commentBox.placeholder = "Please tell us what we could improve...";
  } else {
    commentBox.placeholder = "Tell us about your experience...";
  }
}

// ==========================================
// SUBMIT
// ==========================================

submitButton.addEventListener("click", async () => {
  const school = document.getElementById("school").value;

  const comment = commentBox.value.trim();

  if (!school) {
    alert("Please choose your school.");

    return;
  }

  if (!rating) {
    alert("Please rate your overall experience.");

    return;
  }

  if (foodGood === null) {
    alert("Please rate the food.");

    return;
  }

  if (foodGood === false && !foodReason) {
    alert("Please tell us what could be improved about the food.");

    return;
  }

  if (serviceGood === null) {
    alert("Please rate the service.");

    return;
  }

  if (serviceGood === false && !serviceReason) {
    alert("Please tell us what could be improved about the service.");

    return;
  }

  if ((foodReason === "Other" || serviceReason === "Other") && comment === "") {
    alert("Please tell us a little more about what we could improve.");

    commentBox.focus();

    return;
  }

  submitButton.disabled = true;

  submitButton.textContent = "Submitting...";

  const { error } = await db.from("meal_feedback").insert([
    {
      school: school,

      rating: rating,

      taste_good: foodGood,

      friendly_service: serviceGood,

      food_reason: foodReason,

      service_reason: serviceReason,

      comment: comment,
    },
  ]);

  if (error) {
    console.error("Supabase error:", error);

    alert("Submission failed: " + error.message);

    submitButton.disabled = false;

    submitButton.textContent = "Submit Feedback";

    return;
  }

  showThankYouAndReset();
});

// ==========================================
// SUCCESS + AUTO RESET
// ==========================================

function showThankYouAndReset() {
  submitButton.style.display = "none";

  thankYou.classList.remove("hidden");

  setTimeout(() => {
    resetForm();
  }, 2000);
}

// ==========================================
// RESET FORM
// ==========================================

function resetForm() {
  rating = 0;

  foodGood = null;
  serviceGood = null;

  foodReason = null;
  serviceReason = null;

  // SCHOOL

  document.getElementById("school").value = "";

  // STARS

  stars.forEach((star) => {
    star.classList.remove("active");
  });

  // FOOD

  foodYes.classList.remove("selected");

  foodNo.classList.remove("selected");

  foodReasons.classList.add("hidden");

  clearFoodReasons();

  // SERVICE

  serviceYes.classList.remove("selected");

  serviceNo.classList.remove("selected");

  serviceReasons.classList.add("hidden");

  clearServiceReasons();

  // COMMENT

  commentBox.value = "";

  commentBox.placeholder = "Tell us about your experience...";

  // THANK YOU

  thankYou.classList.add("hidden");

  // SUBMIT BUTTON

  submitButton.style.display = "block";

  submitButton.disabled = false;

  submitButton.textContent = "Submit Feedback";

  // BACK TO TOP

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
