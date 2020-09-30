import { spawn } from 'child_process'

export function utils(): string {
  return 'utils';
}

export async function getHTMLBodyFromBrowserPage(url: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const pythonProcess = spawn('python3', [`./python/get-site-body.py`, url])
    pythonProcess.stdout.on('data', (data) => resolve(data.toString()))
    pythonProcess.stderr.on('data', (data) => resolve(data.toString()))
  })
}
