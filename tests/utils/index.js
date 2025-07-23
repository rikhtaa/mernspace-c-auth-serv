'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected)
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            )
        })
    }
Object.defineProperty(exports, '__esModule', { value: true })
exports.CreateTenant = exports.isJwt = exports.truncateTables = void 0
const truncateTables = (connection) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const entities = connection.entityMetadatas
        for (const entity of entities) {
            const repository = connection.getRepository(entity.name)
            yield repository.clear()
        }
    })
exports.truncateTables = truncateTables
const isJwt = (token) => {
    if (token === null) {
        return false
    }
    const parts = token.split('.')
    if (parts.length !== 3) {
        return false
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8')
        })
        return true
    } catch (_a) {
        return false
    }
}
exports.isJwt = isJwt
const CreateTenant = (repository) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const tenant = yield repository.save({
            name: 'Test tenant',
            address: 'Test address',
        })
        return tenant
    })
exports.CreateTenant = CreateTenant
