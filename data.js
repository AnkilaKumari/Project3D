// data.js
export const planetData = [
    {
      id: "mercury",
      name: "Mercury",
      radius: 2439.7,
      orbitRadius: 57909227,
      period: 88,
      color: 0xaaaaaa,
      moons: []
    },
    {
      id: "earth",
      name: "Earth",
      radius: 6371,
      orbitRadius: 149598262,
      period: 365.25,
      color: 0x3399ff,
      moons: [
        {
          name: "Moon",
          radius: 1737,
          distance: 384400,
          color: 0xaaaaaa
        }
      ]
    },
    {
      id: "mars",
      name: "Mars",
      radius: 3389.5,
      orbitRadius: 227943824,
      period: 687,
      color: 0xff3300,
      moons: []
    },
    {
      id: "jupiter",
      name: "Jupiter",
      radius: 69911,
      orbitRadius: 778340821,
      period: 4333,
      color: 0xffcc66,
      moons: [
        {
          name: "Europa",
          radius: 1560,
          distance: 670900,
          color: 0xddddff
        }
      ]
    }
  ];
  