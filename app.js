const SUPABASE_URL =
  "https://dgjeowpksgwzldnwnvvl.supabase.co";

const SUPABASE_KEY =
  "YOUR-PUBLISHABLE-KEY-HERE";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


let rating = 0;

let foodGood = null;
let serviceGood = null;

let foodReason = null;
let serviceReason = null;


// STAR RATING

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


// FOOD BUTTONS

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

});


foodNo.addEventListener("click", () => {

  foodGood = false;

  foodNo.classList.add("selected");
  foodYes.classList.remove("selected");

  foodReasons.classList.remove("hidden");

});


// FOOD REASONS

document
  .querySelectorAll(
    "[data-food-reason]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        foodReason =
          button.dataset.foodReason;

        document
          .querySelectorAll(
            "[data-food-reason]"
          )
          .forEach(b =>
            b.classList.remove(
              "selected"
            )
          );

        button.classList.add(
          "selected"
        );

      }
    );

  });


// SERVICE BUTTONS

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

  }
);


// SERVICE REASONS

document
  .querySelectorAll(
    "[data-service-reason]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        serviceReason =
          button.dataset.serviceReason;

        document
          .querySelectorAll(
            "[data-service-reason]"
          )
          .forEach(b =>
            b.classList.remove(
              "selected"
            )
          );

        button.classList.add(
          "selected"
        );

      }
    );

  });


// SUBMIT

document
  .getElementById("submitButton")
  .addEventListener(
    "click",
    async () => {

      const school =
        document.getElementById(
          "school"
        ).value;

      const comment =
        document.getElementById(
          "comment"
        ).value;


      if (!school) {

        alert(
          "Please choose your school."
        );

        return;
      }


      if (!rating) {

        alert(
          "Please rate your overall experience."
        );

        return;
      }


      if (foodGood === null) {

        alert(
          "Please rate the food."
        );

        return;
      }


      if (serviceGood === null) {

        alert(
          "Please rate the service."
        );

        return;
      }


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


      if (error) {

        console.error(
          "Supabase error:",
          error
        );

        alert(
          "Sorry, your feedback could not be submitted."
        );

        return;
      }


      document
        .getElementById(
          "submitButton"
        )
        .style.display =
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
