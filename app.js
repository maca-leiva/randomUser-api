const express = require("express");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(express.json());

async function obtenerUsuarios(limit = 10) {
  try {
    const response = await axios.get(
      `https://randomuser.me/api/?results=${limit}`
    );
    return response.data.results || [];
  } catch (error) {
    throw error.response?.data || "Error al obtener usuarios";
  }
}

async function obtenerCocktail() {
  try {
    const response = await axios.get(
      "https://www.thecocktaildb.com/api/json/v1/1/random.php"
    );
    const cocktail = response.data.drinks[0];
    return cocktail.strDrink || "Sin cóctel";
  } catch (error) {
    throw "Error al obtener cóctel";
  }
}

app.get("/users", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const categorize = req.query.categorize || null;

    const usuarios = await obtenerUsuarios(limit);

    // Formatear la respuesta en formato JSON
    const formattedResponse = {
      users: {},
    };

    // Filtrar usuarios por género si el parámetro categorize es 'gender'
    if (categorize === "gender") {
      formattedResponse.users = {
        female: usuarios
          .filter((user) => user.gender === "female")
          .map(formatUser),
        male: usuarios.filter((user) => user.gender === "male").map(formatUser),
      };
    } else {
      // Sin categorización, se devuelven todos los usuarios
      formattedResponse.users = usuarios.map(formatUser);
    }

    res.json(formattedResponse);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error });
  }
});

app.get("/users/drink", async (req, res) => {
  try {
    const limit = 1; // Solo se devuelve un usuario
    const usuarios = await obtenerUsuarios(limit);
    const cocktail = await obtenerCocktail();

    // Formatear la respuesta en formato JSON
    const formattedResponse = {
      users: usuarios.map((user) => ({
        nombre: `${user.name.first} ${user.name.last}`,
        email: user.email,
        nacionalidad: user.location.country,
        "coctail-favorito": cocktail,
      })),
    };

    res.json(formattedResponse);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error });
  }
});

function formatUser(user) {
  return {
    name: `${user.name.first} ${user.name.last}`,
    email: user.email,
    // Puedes agregar más información del usuario según tus necesidades
  };
}

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
