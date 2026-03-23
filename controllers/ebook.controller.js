const OPEN_LIBRARY_BASE = "https://openlibrary.org";
const ARCHIVE_BASE = "https://archive.org/download";

const buildCoverUrl = (coverId, size = "L") =>
  `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;

const mapSubjectWork = (work) => ({
  title: work.title,
  authors: (work.authors || []).map((author) => author.name),
  coverId: work.cover_id || null,
  coverUrl: work.cover_id ? buildCoverUrl(work.cover_id) : null,
  workId: work.key ? work.key.replace("/works/", "") : null,
  lendingIdentifier: work.lending_identifier_s || null,
  editionCount: work.edition_count || 0
});

const mapSearchDoc = (doc) => ({
  title: doc.title,
  authors: doc.author_name || [],
  coverId: doc.cover_i || null,
  coverUrl: doc.cover_i ? buildCoverUrl(doc.cover_i) : null,
  workId: doc.key ? doc.key.replace("/works/", "") : null,
  editionId: Array.isArray(doc.edition_key) ? doc.edition_key[0] : null,
  lendingIdentifier: doc.lending_identifier_s || null
});

const requestJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`External API error (${response.status})`);
  }
  return response.json();
};

export const getApologeticsBySubject = async (request, response) => {
  try {
    const limit = Number(request.query.limit || 20);
    const offset = Number(request.query.offset || 0);
    const url = `${OPEN_LIBRARY_BASE}/subjects/apologetics.json?limit=${limit}&offset=${offset}`;
    const data = await requestJson(url);

    return response.status(200).json({
      success: true,
      limit,
      offset,
      total: data.work_count || 0,
      books: (data.works || []).map(mapSubjectWork)
    });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

export const searchEbooks = async (request, response) => {
  try {
    const { q, title, author } = request.query;
    const page = Number(request.query.page || 1);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (title) params.set("title", title);
    if (author) params.set("author", author);
    params.set("page", String(page));

    const url = `${OPEN_LIBRARY_BASE}/search.json?${params.toString()}`;
    const data = await requestJson(url);

    return response.status(200).json({
      success: true,
      page,
      total: data.numFound || 0,
      books: (data.docs || []).map(mapSearchDoc)
    });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

export const getWorkDetails = async (request, response) => {
  try {
    const { workId } = request.params;
    const data = await requestJson(`${OPEN_LIBRARY_BASE}/works/${workId}.json`);
    return response.status(200).json({ success: true, data });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

export const getEditionDetails = async (request, response) => {
  try {
    const { editionId } = request.params;
    const data = await requestJson(`${OPEN_LIBRARY_BASE}/books/${editionId}.json`);
    return response.status(200).json({ success: true, data });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

export const getCoverUrl = async (request, response) => {
  const { coverId } = request.params;
  const size = request.query.size || "L";
  return response.status(200).json({
    success: true,
    coverUrl: buildCoverUrl(coverId, size)
  });
};

export const getDownloadLinks = async (request, response) => {
  const { identifier } = request.params;
  return response.status(200).json({
    success: true,
    identifier,
    pdf: `${ARCHIVE_BASE}/${identifier}/${identifier}.pdf`,
    epub: `${ARCHIVE_BASE}/${identifier}/${identifier}.epub`
  });
};
