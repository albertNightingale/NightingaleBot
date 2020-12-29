const index = require('./index');

describe('test for setFiles()', () => {
    test('test for a file that does not exist', () => {
        const mapTEST = index.setFiles('.TEST/'); 
        expect(mapTEST.size).toBe(0);
    });
    
    test('test for a folder that does exist', () => {
        const mapTEST1 = index.setFiles('./Test/');
        expect(mapTEST1.size).toBe(2);
        expect(mapTEST1.get('TEST').name).toBe('TEST');
        expect(mapTEST1.get('TEST2').execute()).toBe('TEST2 COMPLETE');
    });
    
    test('test for a nested folder that does exist', () => {    
        const mapTEST2 = index.setFiles('./Test/TestFolder/');
        expect(mapTEST2.size).toBe(1);
    
        expect(mapTEST2.get('TEST3').name).toBe('TEST3');
        expect(mapTEST2.get('TEST3').execute()).toBe('TEST3 COMPLETE');
    });
})
