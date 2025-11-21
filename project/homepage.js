// =====================
// MODEL LOCATION
// =====================
const MODEL_URL = "./my_model/";

let model;
let maxPredictions;

// Load the model
async function loadModel() {
    try {
        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully!");
    } catch (error) {
        console.error("Model failed to load:", error);
    }
}

loadModel();

// =====================
// CLASS TO SCORE MAPPING (robust)
// =====================
function getClassScore(className) {
    const name = className.toLowerCase().trim();

    if (name.includes("handwritten")) return { score: "90-100", label: "Excellent" };
    if (name.includes("flash")) return { score: "80-90", label: "Great" };
    if (name.includes("printed")) return { score: "70-80", label: "Good" };
    if (name.includes("cheat")) return { score: "20-40", label: "Needs Improvement" };
    return { score: "0-20", label: "Very Low" };
}

// =====================
// FILE UPLOAD HANDLING
// =====================
document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const previewDiv = document.getElementById("preview");
    previewDiv.innerHTML = "";

    const img = document.createElement("img");
    img.classList = "mx-auto mt-4 rounded-lg shadow-md";
    img.style.maxWidth = "350px";
    img.src = URL.createObjectURL(file);

    previewDiv.appendChild(img);

    img.onload = () => {
        runPrediction(img);
    };
});

// =====================
// PREDICTION FUNCTION
// =====================
async function runPrediction(imageElement) {
    if (!model) {
        document.getElementById("image-result").innerHTML =
            "❌ Model not loaded yet!";
        return;
    }

    const resultDiv = document.getElementById("image-result");

    try {
        const prediction = await model.predict(imageElement);

        // Get the class with highest probability
        const bestClass = prediction.reduce((prev, curr) =>
            curr.probability > prev.probability ? curr : prev
        );

        // Map to score & label
        const { score, label } = getClassScore(bestClass.className);

        // Update navbar
        document.getElementById("navbarScore").textContent = `${score}: ${label}`;

        // Show prediction details
        let outputHTML = "<h3 class='text-xl mb-2'>Results</h3>";
        prediction.forEach(p => {
            outputHTML += `${p.className}: ${(p.probability * 100).toFixed(2)}%<br>`;
        });
        outputHTML += `<br><strong>Final Score:</strong> ${score} (${label})`;
        resultDiv.innerHTML = outputHTML;

        // Debug: log predicted class
        console.log("Predicted class:", bestClass.className);
        console.log("Mapped score:", score, label);

    } catch (err) {
        resultDiv.innerHTML =
            "<span style='color:red;'>❌ Prediction failed — Check model path!</span>";
        console.error(err);
    }
}

// =====================
// MODAL HANDLING
// =====================
document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("open-modal-btn");
    const closeBtn = document.getElementById("close-modal-btn");
    const overlay = document.getElementById("study-modal-overlay");
    const card = document.getElementById("study-modal-card");

    // Open modal
    openBtn.addEventListener("click", () => {
        overlay.classList.remove("opacity-0", "pointer-events-none");
        card.classList.remove("opacity-0", "scale-95");
    });

    // Close modal
    closeBtn.addEventListener("click", () => {
        overlay.classList.add("opacity-0", "pointer-events-none");
        card.classList.add("opacity-0", "scale-95");
    });

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.add("opacity-0", "pointer-events-none");
            card.classList.add("opacity-0", "scale-95");
        }
    });
});
