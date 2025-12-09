import { build } from 'esbuild'
import fg from 'fast-glob'
import { watch } from 'chokidar'

async function buildAll() {
	const entryPoints = await fg('srcs/public/**/*.ts')
	console.log('Building files:', entryPoints)

	await build({
		entryPoints,
		outbase: 'srcs/public',
		outdir: 'dist/public',
		bundle: true,
		splitting: true,
		format: 'esm',
		platform: 'browser'
	})
}

buildAll().catch(console.error)

watch('srcs/public', { ignoreInitial: true }).on('all', async () => {
	console.log('Change detected, rebuilding...')
	await buildAll()
})
