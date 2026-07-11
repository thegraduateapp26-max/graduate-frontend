(function () {
  var API_BASE = 'https://graduate-backend-production.up.railway.app';

  // Interactive 3D graduation cap lives in cap3d.js (Three.js module script)

  // --- Live stats ---
  function setStat(key, value) {
    var el = document.querySelector('[data-stat="' + key + '"]');
    if (el) el.textContent = value;
  }

  Promise.allSettled([
    fetch(API_BASE + '/api/users').then(function (r) { return r.json(); }),
    fetch(API_BASE + '/api/jobs').then(function (r) { return r.json(); }),
    fetch(API_BASE + '/api/scholarships').then(function (r) { return r.json(); }),
  ]).then(function (results) {
    var users = results[0].status === 'fulfilled' ? results[0].value : [];
    var jobs = results[1].status === 'fulfilled' ? results[1].value : [];
    var scholarships = results[2].status === 'fulfilled' ? results[2].value : [];

    setStat('members', (users.length || 0) + '+');
    setStat('jobs', jobs.length || 0);
    setStat('scholarships', scholarships.length || 0);

    renderJobs(jobs.slice(0, 3));
  }).catch(function () {
    setStat('members', '—');
    setStat('jobs', '—');
    setStat('scholarships', '—');
  });

  function renderJobs(jobs) {
    var grid = document.getElementById('jobGrid');
    if (!grid) return;
    if (!jobs || jobs.length === 0) {
      grid.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1;text-align:center;">No open roles right now — check back soon.</p>';
      return;
    }
    grid.innerHTML = jobs.map(function (job) {
      return (
        '<div class="job-card">' +
          '<div class="job-company">' + escapeHtml(job.company || '') + '</div>' +
          '<h4>' + escapeHtml(job.title || '') + '</h4>' +
          '<div class="job-meta">' + escapeHtml(job.location || 'Remote') + ' &middot; ' + escapeHtml(job.jobType || '') + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
})();
