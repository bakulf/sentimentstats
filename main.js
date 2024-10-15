class Stats {
  #intl;
  #data;

  constructor() {
    this.#intl = new Intl.NumberFormat();

    fetch("./REPORT.json").then(r => r.json()).then(data => this.#showData(data));
  }

  #createCanvas() {
    const div = document.getElementById("modalCanvas");
    while (div.firstChild) div.firstChild.remove();

    const canvas = document.createElement("canvas");
    canvas.setAttribute('id', 'modalDoughnut');
    div.appendChild(canvas);
  }

  #showData(data) {
    data.splice(0, 2);
    this.#data = data;

    const avgS = data.reduce((obj, a) => ({ count: obj.count + a.counter, total: obj.total + (a.score * a.counter) }), { count: 0, total: 0});
    document.getElementById("avgSentiment").innerText = this.#intl.format(avgS.total / avgS.count);
    document.getElementById("totalMsgs").innerText = "Total: " + this.#intl.format(data.reduce((counter, a) => counter + a.counter, 0)) + " - Unique: " + this.#intl.format(data.reduce((counter, a) => a.counter == 1 ? counter + 1 : counter, 0));

    const avgUS = data.filter(a => a.counter === 1).reduce((obj, a) => ({ count: obj.count + a.counter, total: obj.total + (a.score * a.counter) }), { count: 0, total: 0});
    document.getElementById("avgUniqueMsgs").innerText = this.#intl.format(avgUS.total / avgUS.count);

    const sGt06 = data.reduce((obj, a) => ({ count: obj.count + (a.score >= 0.6 ? a.counter : 0), total: obj.total + a.counter }), { total: 0, count: 0});
    document.getElementById("msgSentimentGt06").innerText = `${this.#intl.format(Math.round((sGt06.count / sGt06.total) * 10000) / 100)}%`;

    const s06to0 = data.reduce((obj, a) => ({ count: obj.count + (a.score < 0.6 && a.score >= 0 ? a.counter : 0), total: obj.total + a.counter }), { total: 0, count: 0});
    document.getElementById("msgSentiment06to0").innerText = `${this.#intl.format(Math.round((s06to0.count / s06to0.total) * 10000) / 100)}%`;

    const sLt0 = data.reduce((obj, a) => ({ count: obj.count + (a.score < 0 ? a.counter : 0), total: obj.total + a.counter }), { total: 0, count: 0});
    document.getElementById("msgSentimentLt0").innerText = `${this.#intl.format(Math.round((sLt0.count / sLt0.total) * 10000) / 100)}%`;

    this.#showTrends(data);
  }

  async #showTrends(dataset) {
    this.#renderTrends('sentimentDistributionsLine', 'Sentiment Distribution', 'Sentiment score', dataset.map((a, pos) => pos),
      [{
        label: "Sentiments",
        data: dataset.map(a => a.score),
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      }
     ]);
  }

  #renderTrends(id, title, y_title, labels, datasets) {
    const ctx = document.getElementById(id);
    const chart = new Chart(ctx, {
      type: "line",
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title,
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
              text: y_title,
            },
          }
        }
      },
      data: {
        labels,
        datasets,
      },
    });
  }
}

const stats = new Stats();
