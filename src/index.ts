import prompts, { type PromptObject } from 'prompts';
import fs from 'fs';
import path from 'path';

// Enum for Frameworks
enum Framework {
    REACT_VITE = 'react_vite',
    VUE_VITE = 'vue_vite',
    SVELTE = 'svelte',
    NEXT_JS = 'next_js',
    SOLID_JS = 'solid_js',
    QWIK = 'qwik',
    REMIX = 'remix',
    SVELTEKIT = 'sveltekit',
    ANGULAR = 'angular',
}

// Function to create framework choices for prompts
const createFrameworkChoices = () => {
    return Object.entries(Framework).map(([key, value]) => ({
        title: key.replace(/_/g, ' '), // Format key for display
        value
    }));
};

// Define content paths for each framework, excluding CSS files used for @tailwind
const contentPaths: Record<Framework, string[]> = {
    [Framework.REACT_VITE]: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    [Framework.VUE_VITE]: ['./index.html', './src/**/*.{js,ts,vue}'],
    [Framework.SVELTE]: ['./index.html', './src/**/*.{js,svelte}'],
    [Framework.NEXT_JS]: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    [Framework.SOLID_JS]: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    [Framework.QWIK]: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    [Framework.REMIX]: ['./app/**/*.{js,ts,jsx,tsx}'],
    [Framework.SVELTEKIT]: ['./src/**/*.{html,js,svelte,ts}'],
    [Framework.ANGULAR]: ['./src/**/*.{html,ts}'],
};

// Function to generate Tailwind CSS configuration
const generateTailwindConfig = (framework: Framework): string => {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ${JSON.stringify(contentPaths[framework], null, 4)},
    theme: {
        extend: {
            // Customizations go here (e.g., colors, spacing)
        },
    },
    plugins: [],
};`;
};

// Function to write a file and handle potential errors
const writeFile = (filePath: string, data: string): void => {
    try {
        fs.writeFileSync(filePath, data.trim());
        console.log(`✅ Successfully generated: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error writing file ${filePath}:`, error instanceof Error ? error.message : error);
    }
};

// Function to create the CSS file for the specified framework
const createCssFile = (framework: Framework): void => {
    let cssFilePath: string;

    switch (framework) {
        case Framework.NEXT_JS:
            cssFilePath = path.join(process.cwd(), 'app', 'globals.css'); // Example path for Next.js
            break;
        case Framework.SVELTEKIT:
            cssFilePath = path.join(process.cwd(), 'src', 'app.css');
            break;
        case Framework.ANGULAR:
            cssFilePath = path.join(process.cwd(), 'src', 'styles.css');
            break;
        default:
            cssFilePath = path.join(process.cwd(), 'src', 'index.css'); // Default path for others
            break;
    }

    const cssContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
    writeFile(cssFilePath, cssContent);
};

// Main function to execute the prompt and generate the config
const main = async () => {
    const questions: PromptObject[] = [
        {
            type: 'select',
            name: 'framework',
            message: 'Choose Framework or Library',
            choices: createFrameworkChoices(),
        },
    ];

    try {
        // Get user input
        const response = await prompts(questions);
        const { framework } = response as { framework: Framework };

        // Generate Tailwind configuration
        const tailwindConfig = generateTailwindConfig(framework);

        // Define output path and write the Tailwind config to a file
        const outputPath = path.join(process.cwd(), 'tailwind.config.js');
        writeFile(outputPath, tailwindConfig);

        // Create the CSS file based on the selected framework
        createCssFile(framework);
    } catch (error) {
        console.error('❌ An error occurred while generating the Tailwind configuration:', error instanceof Error ? error.message : error);
    }
};

// Execute the main function
main();
