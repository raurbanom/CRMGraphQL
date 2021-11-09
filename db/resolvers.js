// Data
const cursos = require("./data.json");

// Resolvers
const resolvers = {
    Query: {
        obtenerCursos: () => cursos,
        obtenerTecnologia: () => cursos,
        obtenerCurso: (_, { input }, ctx, info) => {
            const result = cursos.filter(curso => curso.tecnologia == input.tecnologia)

            return result;
        }
    }
};

module.exports = resolvers;