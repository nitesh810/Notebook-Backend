import jwt from 'jsonwebtoken';

const JWT_SECRET = "PassWorDISSecurE";

const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    console.log(token);
    const bearerToken = token.split(" ")[1];
    if (!bearerToken) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        // Verify token
        const data = jwt.verify(bearerToken, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
}

export default fetchuser;