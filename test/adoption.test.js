import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import userModel from '../src/dao/models/User.js';
import petModel from '../src/dao/models/Pet.js';
import adoptionModel from '../src/dao/models/Adoption.js';

let mongoServer;
const requester = supertest(app);

// ──────────────────────────────────────────────
//  Setup y teardown global
// ──────────────────────────────────────────────
before(async function () {
    this.timeout(60000); // mongodb-memory-server puede tardar en descargarse la primera vez
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

after(async function () {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpia la DB entre cada test para garantizar aislamiento
afterEach(async function () {
    await userModel.deleteMany({});
    await petModel.deleteMany({});
    await adoptionModel.deleteMany({});
});

// ──────────────────────────────────────────────
//  GET /api/adoptions
// ──────────────────────────────────────────────
describe('GET /api/adoptions — Obtener todas las adopciones', function () {

    it('[+] Debe retornar status 200 con payload de array vacío si no hay adopciones', async function () {
        const { statusCode, body } = await requester.get('/api/adoptions');

        expect(statusCode).to.equal(200);
        expect(body).to.have.property('status', 'success');
        expect(body.payload).to.be.an('array').that.is.empty;
    });

    it('[+] Debe retornar todas las adopciones registradas', async function () {
        // Crear datos de prueba directamente en la DB en memoria
        const user = await userModel.create({
            first_name: 'Juan',
            last_name: 'Perez',
            email: 'juan@test.com',
            password: 'hashedpass123'
        });
        const pet = await petModel.create({
            name: 'Rex',
            specie: 'Perro',
            adopted: true,
            owner: user._id
        });
        await adoptionModel.create({ owner: user._id, pet: pet._id });

        const { statusCode, body } = await requester.get('/api/adoptions');

        expect(statusCode).to.equal(200);
        expect(body.payload).to.be.an('array').with.lengthOf(1);
        expect(body.payload[0]).to.have.property('owner');
        expect(body.payload[0]).to.have.property('pet');
    });

    it('[+] Debe retornar múltiples adopciones cuando existen varias', async function () {
        const user1 = await userModel.create({ first_name: 'A', last_name: 'B', email: 'a@test.com', password: 'pass' });
        const user2 = await userModel.create({ first_name: 'C', last_name: 'D', email: 'c@test.com', password: 'pass' });
        const pet1 = await petModel.create({ name: 'Luna', specie: 'Gato', adopted: true });
        const pet2 = await petModel.create({ name: 'Max', specie: 'Perro', adopted: true });
        await adoptionModel.create({ owner: user1._id, pet: pet1._id });
        await adoptionModel.create({ owner: user2._id, pet: pet2._id });

        const { statusCode, body } = await requester.get('/api/adoptions');

        expect(statusCode).to.equal(200);
        expect(body.payload).to.have.lengthOf(2);
    });
});

// ──────────────────────────────────────────────
//  GET /api/adoptions/:aid
// ──────────────────────────────────────────────
describe('GET /api/adoptions/:aid — Obtener una adopción por ID', function () {

    it('[+] Debe retornar la adopción correctamente con un ID válido existente', async function () {
        const user = await userModel.create({
            first_name: 'Ana',
            last_name: 'Lopez',
            email: 'ana@test.com',
            password: 'hashedpass123'
        });
        const pet = await petModel.create({ name: 'Luna', specie: 'Gato', adopted: true });
        const adoption = await adoptionModel.create({ owner: user._id, pet: pet._id });

        const { statusCode, body } = await requester.get(`/api/adoptions/${adoption._id}`);

        expect(statusCode).to.equal(200);
        expect(body).to.have.property('status', 'success');
        expect(body.payload._id).to.equal(adoption._id.toString());
        expect(body.payload.owner).to.equal(user._id.toString());
    });

    it('[-] Debe retornar 404 si la adopción no existe', async function () {
        const idInexistente = new mongoose.Types.ObjectId();

        const { statusCode, body } = await requester.get(`/api/adoptions/${idInexistente}`);

        expect(statusCode).to.equal(404);
        expect(body).to.have.property('status', 'error');
        expect(body.error).to.match(/not found/i);
    });

    it('[-] Debe responder con error cuando el ID tiene formato inválido (no ObjectId)', async function () {
        const { statusCode } = await requester.get('/api/adoptions/id-invalido-xyz');

        // El controlador captura el CastError de Mongoose y retorna 500
        expect(statusCode).to.be.oneOf([400, 500]);
    });
});

// ──────────────────────────────────────────────
//  POST /api/adoptions/:uid/:pid
// ──────────────────────────────────────────────
describe('POST /api/adoptions/:uid/:pid — Crear una adopción', function () {

    it('[+] Debe crear una adopción exitosamente con usuario y mascota válidos', async function () {
        const user = await userModel.create({
            first_name: 'Carlos',
            last_name: 'García',
            email: 'carlos@test.com',
            password: 'hashedpass123',
            pets: []
        });
        const pet = await petModel.create({ name: 'Buddy', specie: 'Perro', adopted: false });

        const { statusCode, body } = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

        expect(statusCode).to.equal(200);
        expect(body).to.have.property('status', 'success');
        expect(body).to.have.property('message', 'Pet adopted');
    });

    it('[+] Debe marcar la mascota como adoptada (adopted: true) luego de la operación', async function () {
        const user = await userModel.create({
            first_name: 'Maria',
            last_name: 'Fernandez',
            email: 'maria@test.com',
            password: 'hashedpass123',
            pets: []
        });
        const pet = await petModel.create({ name: 'Coco', specie: 'Loro', adopted: false });

        await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

        const updatedPet = await petModel.findById(pet._id);
        expect(updatedPet.adopted).to.be.true;
        expect(updatedPet.owner.toString()).to.equal(user._id.toString());
    });

    it('[+] Debe agregar la mascota al array pets del usuario', async function () {
        const user = await userModel.create({
            first_name: 'Sofia',
            last_name: 'Torres',
            email: 'sofia@test.com',
            password: 'hashedpass123',
            pets: []
        });
        const pet = await petModel.create({ name: 'Nala', specie: 'Gato', adopted: false });

        await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser.pets).to.have.lengthOf(1);
    });

    it('[+] Debe guardar el registro de adopción en la colección de adopciones', async function () {
        const user = await userModel.create({
            first_name: 'Pedro',
            last_name: 'Ramirez',
            email: 'pedro@test.com',
            password: 'hashedpass123',
            pets: []
        });
        const pet = await petModel.create({ name: 'Firulais', specie: 'Perro', adopted: false });

        await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

        const adoption = await adoptionModel.findOne({ owner: user._id, pet: pet._id });
        expect(adoption).to.not.be.null;
    });

    it('[-] Debe retornar 404 si el usuario no existe', async function () {
        const userIdFalso = new mongoose.Types.ObjectId();
        const pet = await petModel.create({ name: 'Max', specie: 'Perro', adopted: false });

        const { statusCode, body } = await requester.post(`/api/adoptions/${userIdFalso}/${pet._id}`);

        expect(statusCode).to.equal(404);
        expect(body).to.have.property('status', 'error');
        expect(body.error).to.match(/user/i);
    });

    it('[-] Debe retornar 404 si la mascota no existe', async function () {
        const user = await userModel.create({
            first_name: 'Laura',
            last_name: 'Martínez',
            email: 'laura@test.com',
            password: 'hashedpass123'
        });
        const petIdFalso = new mongoose.Types.ObjectId();

        const { statusCode, body } = await requester.post(`/api/adoptions/${user._id}/${petIdFalso}`);

        expect(statusCode).to.equal(404);
        expect(body).to.have.property('status', 'error');
        expect(body.error).to.match(/pet/i);
    });

    it('[-] Debe retornar 400 si la mascota ya fue adoptada previamente', async function () {
        const user = await userModel.create({
            first_name: 'Roberto',
            last_name: 'Gomez',
            email: 'roberto@test.com',
            password: 'hashedpass123'
        });
        const pet = await petModel.create({ name: 'Nube', specie: 'Gato', adopted: true });

        const { statusCode, body } = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

        expect(statusCode).to.equal(400);
        expect(body).to.have.property('status', 'error');
        expect(body.error).to.include('already adopted');
    });
});
