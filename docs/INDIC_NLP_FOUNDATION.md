# BharatLingo Indic NLP and data foundation

This document separates what BharatLingo ships today from research integrations that must be deployed separately. The app must always preserve curated lessons, local progress, browser audio, and script tracing when an optional model is absent.

## Current, safe architecture

```text
Curated lesson data + canonical stroke references
                 |
        BharatLingo client
                 |
  Optional Express adapters (short timeout, no hard dependency)
       |              |                 |
 IndicXlit       IndicTrans2       ASR/TTS provider
 transliteration translation       speaking support
```

`POST /api/transliterate` and `POST /api/language-identify` are available now. The first only calls a separately hosted, compatible adapter when `INDICXLIT_URL` is configured; otherwise it returns the original text with `source: "unavailable"`. This is intentional: no large model is downloaded, no learner data is silently sent to a third party, and the current application keeps working offline.

## Research resource register

| Resource | Intended role | Status | License / adoption note |
|---|---|---|---|
| IndicXlit / Aksharantar | Roman ↔ native-script transliteration | Adapter ready | IndicXlit code/models are MIT; validate Aksharantar dataset terms before redistribution. |
| IndicTrans2 / BPCC | Translation and bilingual explanations | Existing optional service | Artifact licenses vary by corpus; preserve attribution and review each data split. |
| IndicBERT | Difficulty, similarity, intent, and learner-error features | Future server-side model | MIT model; model-card access conditions still apply. |
| IndicBART | Curated-content assistance and question-generation experiments | Future, human-reviewed pipeline | MIT model; never publish generated exercises without linguistic review. |
| IndicNLG Suite | Evaluation/fine-tuning research | Dataset evaluation only | Some datasets are CC BY-NC; not safe for commercial embedding without review. |
| Dakshina / handwriting trajectory data | Transliteration and future handwriting evaluation | Research only | Do not treat trajectories or OCR images as canonical teaching stroke order. |
| Wikimedia stroke references | Canonical writing-reference investigation | Manual verification required | Check source page and license per asset before inclusion. |

## Provider contract

Run a trusted adapter at `INDICXLIT_URL` that accepts:

```json
{ "text": "namaste", "source": "en", "target": "hi", "direction": "roman-to-native" }
```

and returns:

```json
{ "transliteratedText": "नमस्ते" }
```

The public BharatLingo API validates language IDs and limits requests to 1,000 characters. A provider has four seconds to respond before the app uses its safe fallback.

## Data and learner-safety rules

1. Keep model services server-side; never expose provider keys to the browser.
2. Do not send learner recordings or handwriting to a provider without a clear consent flow and retention policy.
3. Keep curated lessons as the source of truth; generated content requires cultural, linguistic, and safety review.
4. Store source, version, license, and attribution for every imported dataset or asset.
5. Distinguish canonical trace references from handwriting samples and OCR training images.

## Presentation statement

> BharatLingo is designed around structured multilingual learning data, with optional Indic NLP services for transliteration, translation, language understanding, content assistance, and future handwriting analysis. Its core learning experience remains reliable without those services.

## Primary sources

- [IndicXlit / Aksharantar](https://github.com/AI4Bharat/IndicXlit)
- [IndicTrans2](https://github.com/AI4Bharat/IndicTrans2)
- [IndicNLG Suite](https://indicnlp.ai4bharat.org/indicnlg-suite/)
- [IndicBERT model card](https://huggingface.co/ai4bharat/indic-bert)
- [IndicBART model card](https://huggingface.co/ai4bharat/IndicBART)
