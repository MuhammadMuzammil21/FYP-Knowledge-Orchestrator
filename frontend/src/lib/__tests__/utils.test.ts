import { cn } from '../utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            expect(cn('class1', 'class2')).toBe('class1 class2');
        });

        it('should handle conditional classes', () => {
            expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
        });

        it('should handle tailwind merge conflicts', () => {
            expect(cn('px-2', 'px-4')).toBe('px-4');
        });

        it('should handle empty inputs', () => {
            expect(cn()).toBe('');
        });

        it('should handle undefined and null', () => {
            expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
        });
    });
});
