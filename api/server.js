const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = 3000;

server.use(middlewares);

server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));

// Middleware para tratar paginação e customizar resposta
server.use((req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
        let parsed;

        try {
            parsed = JSON.parse(body);
        } catch {
            return originalSend.call(this, body);
        }

        const isArray = Array.isArray(parsed);
        const totalCount = res.getHeader('X-Total-Count');

        const response = {
            value: isArray ? parsed : [],
            count: totalCount ? Number(totalCount) : (isArray ? parsed.length : 1),
            hasSuccess: true,
            hasError: false,
            errors: [],
            httpStatusCode: "OK",
            dataRequisicao: new Date()
        };

        return originalSend.call(this, JSON.stringify(response));
    };

    next();
});

server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running at http://localhost:${port}`);
});

module.exports = server;
