export default function AddPeople({ name, image, alt }) {
  return (
    <section className="flex justify-between p-3">
      <div className="flex items-center gap-2">
        <img className="w-10 h-10 rounded-full" src={image} alt={alt} />
        <h3>{name}</h3>
      </div>
      <button className="px-2 py-1 rounded-full primary-btn bg-primary-yellow h-fit">
        <span className="text-3.5">+ Add people</span>
      </button>
    </section>
  );
}
