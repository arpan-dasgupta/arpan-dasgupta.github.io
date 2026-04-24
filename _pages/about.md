---
layout: about
title: about
permalink: /
# subtitle: <a href='#'>Affiliations</a>. Address. Contacts. Motto. Etc.

profile:
  align: right
  image: profile_pic.jpg
  image_circular: true # crops the image to make it circular
  # more_info: >
  #   <p>555 your office number</p>
  #   <p>123 your address street</p>
  #   <p>Your City, State 12345</p>

# news: true # includes a list of news items
selected_papers: false # hides publication list to keep home page focused
social: true # includes social icons at the bottom of the page
---

Welcome to my site.

I am Arpan Dasgupta, a pre-doctoral researcher at Google DeepMind working on multi-agent systems, reinforcement learning, and decision making.
Use the interactive section below to plan a focused work block, get a quick project idea, and track momentum.

<section class="mt-4 p-4 border rounded" id="interactive-lab">
  <h2 class="h4">Interactive Focus Lab</h2>
  <p class="mb-3">Pick your mood, set a focus duration, and receive a custom prompt.</p>

  <form id="focus-form" class="mb-3">
    <label for="mood-select" class="form-label">Current mood</label>
    <select id="mood-select" class="form-control mb-3">
      <option value="curious">Curious</option>
      <option value="energetic">Energetic</option>
      <option value="calm">Calm</option>
      <option value="stuck">Stuck</option>
    </select>

    <label for="focus-length" class="form-label">Focus length (minutes)</label>
    <input id="focus-length" class="form-range" type="range" min="10" max="90" step="5" value="30" />
    <p class="mb-3">
      Selected length:
      <strong><span id="focus-length-value">30</span> minutes</strong>
    </p>

    <button type="submit" class="btn btn-primary">Start focus block</button>
  </form>

  <div id="focus-output" class="alert alert-light mb-3" role="status" aria-live="polite">
    Your personalized focus prompt will appear here.
  </div>

  <div class="d-flex flex-wrap gap-2 mb-2">
    <button id="idea-button" type="button" class="btn btn-outline-primary">Suggest a micro project</button>
    <button id="motivation-button" type="button" class="btn btn-outline-secondary">Boost motivation</button>
  </div>
  <p id="idea-output" class="mb-2">Click "Suggest a micro project" to get a fresh idea.</p>
  <p id="motivation-output" class="mb-0">Momentum score: <strong><span id="motivation-count">0</span></strong></p>
</section>

<script src="{{ '/assets/js/interactive-site.js' | relative_url | bust_file_cache }}"></script>
