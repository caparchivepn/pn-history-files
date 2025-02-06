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
    importantInfo: 'Info importante',
    importantInfoDesc:
      'veuillez saisir le mot complet pour effectuer une recherche dans les documents.',
    key: 'FR',
  },
  DE: {
    search: 'Suchen',
    nothingFound: 'Kein Dokument entspricht Ihrer Suche',
    showMore: 'Mehr anzeigen',
    importantInfo: 'Wichtige Info',
    importantInfoDesc:
      'bitte geben Sie das vollständige Wort ein, um in den Dokumenten zu suchen.',

    key: 'DE',
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
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  const getLanguage = () => {
    return window.location.href.includes('=de') ? LANGUAGE.DE : LANGUAGE.FR
  }

  const fetchFiles = async (query: string, pageToken = null, reset = false) => {
    try {
      const languageTmp = getLanguage()
      const response = await fetch(
        `/api/fetch-files?query=${encodeURIComponent(query)}&language=${
          languageTmp.key
        }${pageToken ? `&pageToken=${pageToken}` : ''}`,
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

  useEffect(() => {
    setReload(true)
    setNextPageToken(null)
    fetchFiles(debouncedTerm, null, true)
  }, [debouncedTerm])

  const handleLoadMore = () => {
    setReload(true)
    fetchFiles(searchTerm, nextPageToken)
  }

  const language = getLanguage()

  return (
    <div>
      <div className="container max-w-[100rem]">
        <div className="w-1/2 flex items-center">
          <div className="mr-3 max-w-[250px] input relative flex items-center justify-center">
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
        <div className="w-1/2 max-w-sm ml-auto p-4 pt-1 pb-1 mt-1 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-yellow-500 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 16h-1v-4h-1m1 4h.01M12 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div className="text-[10px]">
            <strong>{language.importantInfo}</strong>: {language.importantInfoDesc}
          </div>
        </div>
      </div>

      <div>
        {files?.length > 0 ? (
          <div>
            <ul className="result [&>li>a]:py-4 [&>li]:px-2 [&>li>a]:text-primary-500 [&>li>a.router-link-exact-active]:text-black [&>li]:border-y-stone-100 [&_a]:font-bold [&>li]:border-y-[1px]">
              {files.map((file: GoogleDriveFile, index: number) => (
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
