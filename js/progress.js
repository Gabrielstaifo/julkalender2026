/*
 * Shared per-day quiz progress, stored under one localStorage key.
 * Every storage access is guarded; an in-memory fallback keeps the
 * feature working (without saving) when storage is unavailable.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'advent_progress';
  var memory = {};      // Fallback store for this session.
  var storageOk = true; // Flips to false on the first storage failure.

  // Read the whole progress object; never throws.
  function readAll() {
    if (!storageOk) return memory;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      storageOk = false;
      return memory;
    }
  }

  // Persist the whole progress object; never throws.
  function writeAll(progress) {
    memory = progress;
    if (!storageOk) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      storageOk = false; // Keep working in memory for the rest of the session.
    }
  }

  function getProgress() {
    return readAll();
  }

  function getDay(day) {
    var record = readAll()[String(day)];
    return record && typeof record === 'object' ? record : null;
  }

  function saveDay(day, record) {
    var progress = readAll();
    progress[String(day)] = record;
    writeAll(progress);
  }

  function clearDay(day) {
    var progress = readAll();
    delete progress[String(day)];
    writeAll(progress);
  }

  // Sum of earned stars; a half star counts as 0.5.
  function totalStars() {
    var progress = readAll();
    var total = 0;
    Object.keys(progress).forEach(function (key) {
      var record = progress[key];
      if (record && record.completed && typeof record.stars === 'number') {
        total += record.stars;
      }
    });
    return total;
  }

  // Public helper reused by the day page now and the home page later.
  window.AdventProgress = {
    getProgress: getProgress,
    getDay: getDay,
    saveDay: saveDay,
    clearDay: clearDay,
    totalStars: totalStars
  };
})();
