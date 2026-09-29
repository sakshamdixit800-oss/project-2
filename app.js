const sourceLanguage = document.querySelector("#source-language");
const targetLanguage = document.querySelector("#target-language");
const sourceText = document.querySelector("#source-text");
const translatedText = document.querySelector("#translated-text");
const translateButton = document.querySelector("#translate-button");
const copyButton = document.querySelector("#copy-button");
const speakButton = document.querySelector("#speak-button");
const status = document.querySelector("#status");
const counter = document.querySelector("#counter");
const clearButton = document.querySelector("#clear-button");
const swapButton = document.querySelector("#swap-button");

function setLoading(isLoading) {
  translateButton.disabled = isLoading;
  translateButton.firstChild.textContent = isLoading
    ? "Translating... "
    : "Translate ";
}

function updateCounter() {
  counter.textContent = `${sourceText.value.length.toLocaleString()} / 5,000`;
}

function showTranslation(text, message) {
  translatedText.textContent = text;
  translatedText.className = "";
  status.textContent = message;
  copyButton.disabled = false;
  speakButton.disabled = false;
}

function showTranslationError(message) {
  translatedText.textContent =
    "We couldn't translate that right now. Please try again.";
  translatedText.className = "placeholder";
  status.textContent = message;
  copyButton.disabled = true;
  speakButton.disabled = true;
}

async function translateText() {
  const text = sourceText.value.trim();

  if (!text) {
    status.textContent = "Enter text first";
    sourceText.focus();
    return;
  }
  if (sourceLanguage.value === targetLanguage.value) {
    showTranslation(text, "Languages are the same");
    return;
  }

  setLoading(true);
  status.textContent = "Connecting...";

  try {
    const query = new URLSearchParams({
      q: text,
      langpair: `${sourceLanguage.value}|${targetLanguage.value}`,
    });
    const response = await fetch(`https://api.mymemory.translated.net/get?${query}`);

    if (!response.ok) throw new Error("Translation service unavailable");

    const data = await response.json();
    const translated = data?.responseData?.translatedText;

    if (!translated) throw new Error("No translation returned");
    showTranslation(translated, "Translated just now");
  } catch (error) {
    showTranslationError(error.message);
  } finally {
    setLoading(false);
  }
}

function clearTranslator() {
  sourceText.value = "";
  translatedText.textContent = "Your translation will appear here.";
  translatedText.className = "placeholder";
  status.textContent = "";
  copyButton.disabled = true;
  speakButton.disabled = true;
  updateCounter();
  sourceText.focus();
}

function swapLanguages() {
  [sourceLanguage.value, targetLanguage.value] = [targetLanguage.value, sourceLanguage.value];

  if (!translatedText.classList.contains("placeholder")) {
    [sourceText.value, translatedText.textContent] = [translatedText.textContent, sourceText.value];
    updateCounter();
  }
}

async function copyTranslation() {
  await navigator.clipboard.writeText(translatedText.textContent);
  status.textContent = "Copied to clipboard";
}

function speakTranslation() {
  if (!("speechSynthesis" in window)) {
    status.textContent = "Text-to-speech is not supported";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(translatedText.textContent);
  utterance.lang = targetLanguage.value;
  window.speechSynthesis.speak(utterance);
}

sourceText.addEventListener("input", updateCounter);
sourceText.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    translateText();
  }
});

translateButton.addEventListener("click", translateText);
clearButton.addEventListener("click", clearTranslator);
swapButton.addEventListener("click", swapLanguages);
copyButton.addEventListener("click", async () => {
  await copyTranslation();
});
speakButton.addEventListener("click", speakTranslation);
