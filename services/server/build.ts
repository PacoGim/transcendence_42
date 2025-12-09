import { build } from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'
import { watch } from 'chokidar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicPath = path.join(__dirname, 'srcs/public')
const distPath = path.join(__dirname, 'dist/public')

const watcherPublic = watch(publicPath)

watcherPublic.on('all', (event, filePath, _) => {
	if (path.extname(filePath) === '.ts') {
		if (['add', 'addDir', 'change', 'unlink', 'unlinkDir'].includes(event)) {
			buildSrc(filePath, filePath.replaceAll(publicPath, distPath).replace('.ts', '.js'))
		}
	}
})

function buildSrc(filePath: string, outFile: string) {
	console.log(`Compiling: ${filePath} to ${outFile}`)
	build({
		outfile: outFile,
		entryPoints: [filePath],
		bundle: true,
		platform: 'browser',
		format: 'esm'
	}).catch(error => {
		console.log('Error building: ', publicPath, ' ', error)
	})
}
