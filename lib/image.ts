/**
 * A 10px-wide base64 blur used as the `blurDataURL` for every remote CMS image.
 *
 * The 2022 site pointed `placeholder="blur"` at `/placeholder.jpg` - a full
 * 1990×1150 JPEG - which meant every card downloaded a large image just to show
 * a blur. This inlines ~200 bytes instead, so nothing extra is fetched.
 *
 * @example
 * <Image src={url} placeholder="blur" blurDataURL={BLUR_DATA_URL} ... />
 */
export const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9PjsBCgsLDg0OHBAQHDsoIig7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O//AABEIABAAFAMBIgACEQEDEQH/xAAWAAEBAQAAAAAAAAAAAAAAAAAABgf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgADBBEFITEGEkFRYf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxEhMf/aAAwDAQACEQMRAD8AmdT6nvL25qJRuHpUFYqoQ4LY8k/Z9SIiKlWTk22f/9k=';
