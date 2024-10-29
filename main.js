class Stats {
  #intl;
  #id = 0;

  constructor() {
    this.#intl = new Intl.NumberFormat();

    fetch("./REPORT.json").then(r => r.json()).then(data => {
      this.#showData("Some stats about communication sentiment", data.data);

      data.actions.forEach(action => this.#showData("Stats for: " + action.message, data.data.filter(a => a.actions.includes(action.id))));
    });
  }

  #appendTemplate(title) {
    ++this.#id;
    const container = document.getElementById("container");
    container.innerHTML += `
      <div class="row"><h1>${title}</h1></div>

      <div class="row">
        <div class="col-sm-4 mb-3">
          <div class="card">
            <div class="card-header">Average sentiment</div>
            <div class="card-body">
              <p class="card-text" id="avgSentiment${this.#id}"><span class="lds-circle"><span></span></span></p>
            </div>
          </div>
        </div>
        <div class="col-sm-4 mb-3">
          <div class="card">
            <div class="card-header">Number of messages</div>
            <div class="card-body">
              <p class="card-text" id="totalMsgs${this.#id}"><span class="lds-circle"><span></span></span></p>
            </div>
          </div>
        </div>
        <div class="col-sm-4 mb-3">
          <div class="card">
            <div class="card-header">Average sentiment for unique messages</div>
            <div class="card-body">
              <p class="card-text" id="avgUniqueMsgs${this.#id}"><span class="lds-circle"><span></span></span></p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-4 mb-3">
          <div class="card">
            <div class="card-header">Messages with sentiment greater than 0.6</div>
            <div class="card-body">
              <p class="card-text" id="msgSentimentGt06${this.#id}"><span class="lds-circle"><span></span></span></p>
            </div>
          </div>
        </div>
        <div class="col-sm-4 mb-3">
          <div class="card">
            <div class="card-header">Messages with sentiment between 0.6 and 0</div>
            <div class="card-body">
              <p class="card-text" id="msgSentiment06to0${this.#id}"><span class="lds-circle"><span></span></span></p>
            </div>
          </div>
        </div>
        <div class="col-sm-4 mb-3">
          <div class="card">
            <div class="card-header">Messages with sentiment lower than 0</div>
            <div class="card-body">
              <p class="card-text" id="msgSentimentLt0${this.#id}"><span class="lds-circle"><span></span></span></p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12 mb-3">
          <div class="card">
            <div class="card-header">Sentiment distribution</div>
            <div class="card-img-top"><canvas id="sentimentDistributionsLine${this.#id}"></canvas></div>
          </div>
        </div>
      </div>
    `;

    return this.#id;
  }

  #showData(title, data) {
    const id = this.#appendTemplate(title);

    setTimeout(() => {
    const avgS = data.reduce((obj, a) => ({ count: obj.count + a.counter, total: obj.total + (a.score * a.counter) }), { count: 0, total: 0});
    document.getElementById(`avgSentiment${id}`).innerText = this.#intl.format(avgS.total / avgS.count);
    document.getElementById(`totalMsgs${id}`).innerText = "Total: " + this.#intl.format(data.reduce((counter, a) => counter + a.counter, 0)) + " - Unique: " + this.#intl.format(data.reduce((counter, a) => a.counter == 1 ? counter + 1 : counter, 0));

    const avgUS = data.filter(a => a.counter === 1).reduce((obj, a) => ({ count: obj.count + a.counter, total: obj.total + (a.score * a.counter) }), { count: 0, total: 0});
    document.getElementById(`avgUniqueMsgs${id}`).innerText = this.#intl.format(avgUS.total / avgUS.count);

    const sGt06 = data.reduce((obj, a) => ({ count: obj.count + (a.score >= 0.6 ? a.counter : 0), total: obj.total + a.counter }), { total: 0, count: 0});
    document.getElementById(`msgSentimentGt06${id}`).innerText = `${this.#intl.format(Math.round((sGt06.count / sGt06.total) * 10000) / 100)}%`;

    const s06to0 = data.reduce((obj, a) => ({ count: obj.count + (a.score < 0.6 && a.score >= 0 ? a.counter : 0), total: obj.total + a.counter }), { total: 0, count: 0});
    document.getElementById(`msgSentiment06to0${id}`).innerText = `${this.#intl.format(Math.round((s06to0.count / s06to0.total) * 10000) / 100)}%`;

    const sLt0 = data.reduce((obj, a) => ({ count: obj.count + (a.score < 0 ? a.counter : 0), total: obj.total + a.counter }), { total: 0, count: 0});
    document.getElementById(`msgSentimentLt0${id}`).innerText = `${this.#intl.format(Math.round((sLt0.count / sLt0.total) * 10000) / 100)}%`;

    const ctx = document.getElementById(`sentimentDistributionsLine${id}`);
    const chart = new Chart(ctx, {
      type: "line",
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sentiment Distribution',
          },
        },
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            type: 'time',
            title: {
              display: true
            },
            time: {
              unit: 'day'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Sentiment score',
            },
          }
        }
      },
      data: {
        labels: data.map((a, pos) => pos),
        datasets: [{
            label: "Sentiments",
            data: data.map(a => a.score),
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4
          }]
      },
    });
  }, 100);
  }
}

const stats = new Stats();
