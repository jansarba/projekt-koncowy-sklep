type CartItemProps = {
  cart_id: number;
  beat_title: string;
  bpm: number;
  musical_key: string;
  image_url?: string;
  license_name: string;
  license_price: number;
  onRemove: (cartId: number) => void;
};

const CartItem: React.FC<CartItemProps> = ({
  cart_id,
  beat_title,
  bpm,
  musical_key,
  image_url,
  license_name,
  license_price,
  onRemove,
}) => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b">
      <img
        src={image_url || '/default-image.jpg'}
        alt={beat_title}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{beat_title}</h3>
        <p className="text-sm">
          {bpm} BPM | {musical_key}
        </p>
        <p className="text-sm">License: {license_name}</p>
        <p className="text-sm">Price: ${license_price.toFixed(2)}</p>
      </div>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        onClick={() => onRemove(cart_id)}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;