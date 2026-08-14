const SUPABASE_URL = "https://dgjeowpksgwzldnwnvvl.supabase.co";

const SUPABASE_KEY = "sb_publishable_O7IQlgPKBSi0cxVWZyIHkg_8xeWxrmH";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
let rating = 0;
let tasteGood = null;
let friendlyService = null;


// STAR RATING

const stars = document.querySelectorAll("#stars button");

stars.forEach(star => {

  .addEventListener("click", async () => {

    rating = Number(star.dataset.rating);

    stars.forEach(s => {

      if (Number(s.dataset.rating) <= rating) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }

    });

  });

});


// YES / NO BUTTON HELPER

function setupChoice(yesId, noId, callback) {

  const yesButton = document.getElementById(yesId);
  const noButton = document.getElementById(noId);

  yesButton.addEventListener("click", () => {

    callback(true);

    yesButton.classList.add("selected");
    noButton.classList.remove("selected");

  });

  noButton.addEventListener("click", () => {

    callback(false);

    noButton.classList.add("selected");
    yesButton.classList.remove("selected");

  });

}


setupChoice(
  "tasteYes",
  "tasteNo",
  value => tasteGood = value
);


setupChoice(
  "serviceYes",
  "serviceNo",
  value => friendlyService = value
);


// SUBMISSION

document.getElementById("submitButton")
  .addEventListener("click", () => {

    const school =
      document.getElementById("school").value;

    const meal =
      document.getElementById("meal").value;

    const comment =
      document.getElementById("comment").value;


    if (!school) {
      alert("Please choose your school.");
      return;
    }

    if (!meal) {
      alert("Please choose your meal.");
      return;
    }

    if (!rating) {
      alert("Please rate your meal.");
      return;
    }


    const feedback = {

      school,
      meal,
      rating,
      tasteGood,
      friendlyService,
      comment,

      submitted:
        new Date().toISOString()

    };


const { data, error } = await db
  .from("meal_feedback")
  .insert([
    {
      school: school,
      meal: meal,
      rating: rating,
      taste_good: tasteGood,
      friendly_service: friendlyService,
      comment: comment
    }
  ]);

if (error) {
  console.error("Supabase error:", error);
  alert("Sorry, your feedback could not be submitted.");
  return;
}

console.log("Feedback saved!");


    document.getElementById("submitButton")
      .style.display = "none";

    document.getElementById("thankYou")
      .classList.remove("hidden");

  });
