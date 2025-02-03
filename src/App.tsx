import { useEffect, useState } from 'react'
import './App.css'
import IconFile from './IconFile'
import IconSearch from './IconSearch'
import IconLoading from './IconLoading'

const LANGUAGE = {
  FR: {
    search: 'Rechercher',
    nothingFound: 'Aucun document ne correspond à votre recherche',
    showMore: 'Afficher plus',
  },
  DE: {
    search: 'Suchen',
    nothingFound: 'Kein Dokument entspricht Ihrer Suche',
    showMore: 'Mehr anzeigen',
  },
}
interface GoogleDriveFile {
  id: string
  name: string
}

function App() {
  const [initLoad, setInitLoad] = useState(true)
  const [reload, setReload] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [nextPageToken, setNextPageToken] = useState(null)
  const [files, setFiles] = useState<GoogleDriveFile[]>([])
  const [debouncedTerm, setDebouncedTerm] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 350)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    setReload(true)
    setNextPageToken(null)
    fetchFiles(debouncedTerm, null, true)
  }, [debouncedTerm])

  const handleLoadMore = () => {
    setReload(true)
    fetchFiles(searchTerm, nextPageToken)
  }

  const fetchFiles = async (query: string, pageToken = null, reset = false) => {
    try {
      const response = await fetch(
        `/api/fetch-files?query=${encodeURIComponent(query)}${
          pageToken ? `&pageToken=${pageToken}` : ''
        }`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      setFiles((prevFiles: GoogleDriveFile[]) =>
        reset ? data.files : [...prevFiles, ...data.files],
      )
      setNextPageToken(data.nextPageToken || null)
      setInitLoad(false)
      setReload(false)
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const language = window.location.href.includes('/de')
    ? LANGUAGE.DE
    : LANGUAGE.FR

  return (
    <div>
      <div className="container">
        <div className="mr-3 input relative flex items-center justify-center">
          <input
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-full"
            type="search"
            value={searchTerm}
            placeholder={language.search}
          />
          <IconSearch />
        </div>
        {!initLoad && reload && <IconLoading />}
      </div>

      <div>
        {files?.length > 0 ? (
          <div>
            <ul className="result [&>li>a]:py-4 [&>li]:px-2 [&>li>a]:text-primary-500 [&>li>a.router-link-exact-active]:text-black [&>li]:border-y-stone-100 [&_a]:font-bold [&>li]:border-y-[1px]">
              {files.map((file: GoogleDriveFile, index:number) => (
                <li className="mt-[-1px]" key={index}>
                  <a
                    className="flex justify-between gap-4"
                    href={`https://drive.google.com/file/d/${file.id}/view`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {file.name}
                    <IconFile />
                  </a>
                </li>
              ))}
            </ul>
            {nextPageToken && (
              <div className="flex items-center mt-4 justify-center">
                <button
                  onClick={handleLoadMore}
                  className="cursor-pointer text-center  bg-[#009984] text-white font-bold py-2 px-4 rounded border border-[#009984] hover:bg-[#007c6d]"
                >
                  {language.showMore}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {!initLoad && (
              <p className="text-center">{language.nothingFound}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
