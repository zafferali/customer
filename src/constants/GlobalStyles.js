import { StyleSheet } from 'react-native';
import colors from './colors';

export const GlobalStyles = StyleSheet.create({
    lightBorder: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderColor: colors.border,
        borderWidth: 1,
    },
    lightGrayCard: {
        backgroundColor: colors.lightGray,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 12,
        width: 160,
    },
    smThemeText: {
        fontSize: 16,
        color: colors.theme,
        fontWeight: '600',
    },
    lgBlackText: {
        fontSize: 24,
        color: 'black',
        fontWeight: '600',
    },
    mdBlackText: {
        fontSize: 22,
        color: 'black',
        fontWeight: '600',
    }
});
