---
project: Real-time Forest Fire Detection AI
summary: A Random Forest model embedded with Arduino hardware that predicts forest fire risk at the edge from live temperature, humidity and smoke sensors.
role: TODO # TODO(Akrem)
team: TODO
period: TODO
stack: [Python, Scikit-learn, Random Forest, Arduino, PySerial, C/C++, Sensors]
links: {}
relicName: Ember Sentinel
lore: >-
  A watcher set at the forest's edge, that knows the smell of smoke before the first flame.
  The keeper of a bonfire, it is said, must also know when fire becomes a threat.
skill:
  name: Early Warning
  text: Reads temperature, humidity and smoke in real time over serial and predicts fire risk on the spot, with no cloud needed.
scaling:
  - { attr: Machine Learning, grade: A }
  - { attr: Embedded, grade: B }
  - { attr: Data, grade: B }
image: /images/relics/ember-sentinel.webp
order: 3
featured: false
---

## The Foe

Forest fires spread fastest in the first minutes, often far from any connectivity.

<!-- TODO(Akrem): context — where, why, who -->

## The Arms

- **Random Forest** model trained on a curated tropical forest fire dataset.
- **Arduino** microcontroller reading **temperature, humidity and smoke** sensors.
- **PySerial** bridge feeding live readings to the model for **edge predictions**.

## The Battle

<!-- TODO(Akrem): dataset curation, sensor noise, latency, false positives -->

## Victory

<!-- TODO(Akrem): accuracy / recall, demo results -->

## Spoils

<!-- TODO(Akrem): lessons -->
